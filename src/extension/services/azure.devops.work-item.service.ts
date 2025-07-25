import * as devops from "azure-devops-node-api";
import { window } from "vscode";

import { WebApi } from 'azure-devops-node-api/WebApi';
import { WorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';

import { ICommunicationService } from "../core/communication";
import { DefaultTasks } from "../core/default-tasks";
import { ILogger, LogLevel } from "../core/telemetry";
import { IWorkItemService, WorkItem, WorkItemState, WorkItemType } from "../core/workflow";
import { PreDefinedTaskJsonPatchDocumentMapper } from "../core/workflow/pre-defined-tasks/pre-defined-task-json-patch-document-mapper";
import { DevOpsService } from "../services/devops-service";

export class AzureDevOpsWorkItemService implements IWorkItemService {
    constructor(
        private readonly logger: ILogger,
        private readonly communicationService: ICommunicationService,
        private readonly devOpsService: DevOpsService
    ) {

    }

    public async start(workItemId: number): Promise<WorkItem | null> {
        const workItem: WorkItem | null = await this.getWorkItem(workItemId);
        if (!workItem) {
            this.logger.log(LogLevel.Error, `Work item #${workItemId} not found. Exiting."`);
            return null;
        }

        const confirmationMessage = `Do you want to start work item #${workItemId} - ${workItem.title}?`;
        const confirm = await this.communicationService.confirm(confirmationMessage);
        if (!confirm) {
            this.logger.log(LogLevel.Warning, "User declined to start the work item. Exiting.");
            return null;
        }

        await this.changeWorkItemState(workItem, new WorkItemState("Doing"));
        await this.createDefaultTasks(workItem);
        return workItem;
    }

    public async getWorkItem(workItemId: number): Promise<WorkItem | null> {
        try {
            const workItemTrackingClient = await this.getWorkItemTrackingClient();
            if (!workItemTrackingClient) {
                return null;
            }

            const parentWorkItem = await workItemTrackingClient.getWorkItem(workItemId);
            const workItemTitle = parentWorkItem.fields?.['System.Title'] as string;
            return {
                id: workItemId,
                title: workItemTitle,
                type: new WorkItemType(parentWorkItem.fields?.['System.WorkItemType'] as string),
                state: new WorkItemState(parentWorkItem.fields?.['System.State'] as string),
                areaPath: parentWorkItem.fields?.['System.AreaPath'] as string,
                iterationPath: parentWorkItem.fields?.['System.IterationPath'] as string,
                description: parentWorkItem.fields?.['System.Description'] as string || "",
                remainingWork: parentWorkItem.fields?.['Microsoft.VSTS.Scheduling.RemainingWork'] as number || 0,
                activity: parentWorkItem.fields?.['Microsoft.VSTS.Common.Activity'] as string || "",
                additionalFields: parentWorkItem.fields || {}
            };
        } catch (error) {
            window.showErrorMessage(`Failed to retrieve work item #${workItemId}: ${(error as Error).message}`);
            this.logger.log(LogLevel.Error, `Failed to retrieve work item #${workItemId}: ${(error as Error).message}`);
            return null;
        }
    }

    public async changeWorkItemState(workItem: WorkItem, state: WorkItemState): Promise<void> {
        try {
            const workItemTrackingClient = await this.getWorkItemTrackingClient();
            if (!workItemTrackingClient) {
                return;
            }

            const projectName = await this.devOpsService.getProjectName();
            if (!projectName) {
                window.showErrorMessage("Azure DevOps project is not configured. Cannot change work item state.");
                this.logger.log(LogLevel.Error, "Azure DevOps project is not configured. Cannot change work item state.");
                return;
            }

            if (!workItem.id) {
                window.showErrorMessage("Work item ID is required to change state.");
                this.logger.log(LogLevel.Error, "Work item ID is required to change state.");
                return;
            }

            const patchDocument = [
                {
                    op: "add",
                    path: "/fields/System.State",
                    value: state.name
                }
            ];

            await workItemTrackingClient.updateWorkItem(
                [],
                patchDocument,
                workItem.id
            );

            workItem.state = state;
            this.logger.log(LogLevel.Information, `Successfully changed work item #${workItem.id} state to '${state.name}'.`);
        } catch (error) {
            const errorMessage = `Failed to change work item #${workItem.id} state to '${state.name}': ${(error as Error).message}`;
            window.showErrorMessage(errorMessage);
            this.logger.log(LogLevel.Error, errorMessage);
            throw error;
        }
    }

    public async createDefaultTasks(workItem: WorkItem): Promise<void> {
        const workItemTrackingClient = await this.getWorkItemTrackingClient();
        if (!workItemTrackingClient) {
            return;
        }

        const organizationUri = await this.devOpsService.getOrganizationUri();
        if (!organizationUri) {
            window.showErrorMessage("Unable to create default tasks without an Azure DevOps organization configured.");
            this.logger.log(LogLevel.Error, "Unable to create default tasks without an Azure DevOps organization configured.");
            return;
        }

        const projectName = await this.devOpsService.getProjectName();
        if (!projectName) {
            window.showErrorMessage("Azure DevOps project is not configured. Commands that require it will not work.");
            this.logger.log(LogLevel.Error, "Azure DevOps project is not configured. Commands that require it will not work.");
            return;
        }

        const userDisplayName = await this.devOpsService.getUserDisplayName();
        if (!userDisplayName) {
            window.showErrorMessage("Unable to create default tasks without a user display name configured.");
            this.logger.log(LogLevel.Error, "Unable to create default tasks without a user display name configured.");
            return;
        }

        const taskMapper = new PreDefinedTaskJsonPatchDocumentMapper(userDisplayName, organizationUri, workItem.id || -1, workItem.areaPath || "", workItem.iterationPath || "");
        for (const task of DefaultTasks) {
            // if (task.requiredFields && !task.requiredFields.every(field => workItemFields[field] !== undefined && workItemFields[field] !== null && workItemFields[field] !== '')) {
            // 	this.logger.log(LogLevel.Warning, `Skipping task '${task.name}' as one or more required fields are missing or empty.`);
            // 	continue;
            // }

            try {
                const patchDocument = taskMapper.map(task);
                const createdTask = await workItemTrackingClient.createWorkItem(
                    [],
                    patchDocument,
                    projectName,
                    'Task'
                );

                this.logger.log(LogLevel.Debug, `Created task '${task.name}' with ID ${createdTask.id} under work item #${workItem.id}.`);
            } catch (error) {
                const errorMessage = (error as Error).message;
                this.logger.log(LogLevel.Error, `Failed to create task '${task.name}': ${errorMessage}`);
            }
        }
    }

    public async createTask(parentWorkItemId: number, title: string, description: string = ''): Promise<void> {
        const workItemTrackingClient = await this.getWorkItemTrackingClient();
        if (!workItemTrackingClient) {
            return;
        }

        const organizationUri = await this.devOpsService.getOrganizationUri();
        if (!organizationUri) {
            window.showErrorMessage("Unable to create task without an Azure DevOps organization configured.");
            this.logger.log(LogLevel.Error, "Unable to create task without an Azure DevOps organization configured.");
            return;
        }

        const projectName = await this.devOpsService.getProjectName();
        if (!projectName) {
            window.showErrorMessage("Azure DevOps project is not configured. Commands that require it will not work.");
            this.logger.log(LogLevel.Error, "Azure DevOps project is not configured. Commands that require it will not work.");
            return;
        }

        // Get parent work item to inherit area path and iteration path
        let parentAreaPath = "";
        let parentIterationPath = "";
        try {
            const parentWorkItem = await workItemTrackingClient.getWorkItem(parentWorkItemId);
            parentAreaPath = parentWorkItem.fields?.['System.AreaPath'] as string || "";
            parentIterationPath = parentWorkItem.fields?.['System.IterationPath'] as string || "";
        } catch (error) {
            this.logger.log(LogLevel.Warning, `Could not retrieve parent work item ${parentWorkItemId} for area/iteration paths: ${(error as Error).message}`);
        }

        const defaultTaskState = await this.devOpsService.getDefaultTaskState();

        const document = [
            {
                op: "add",
                path: "/fields/System.Title",
                value: title
            },
            {
                op: "add",
                path: "/fields/System.WorkItemType",
                value: "Task"
            },
            {
                op: "add",
                path: "/fields/System.State",
                value: defaultTaskState
            },
            {
                op: "add",
                path: "/fields/System.Description",
                value: description
            },
            {
                op: "add",
                path: "/relations/-",
                value: {
                    rel: "System.LinkTypes.Hierarchy-Reverse",
                    url: `${organizationUri}${projectName}/_apis/wit/workItems/${parentWorkItemId}`
                }
            }
        ];

        // Add area path if available from parent
        if (parentAreaPath) {
            document.push({
                op: "add",
                path: "/fields/System.AreaPath",
                value: parentAreaPath
            });
        }

        // Add iteration path if available from parent
        if (parentIterationPath) {
            document.push({
                op: "add",
                path: "/fields/System.IterationPath",
                value: parentIterationPath
            });
        }

        try {
            const createdTask = await workItemTrackingClient.createWorkItem(
                [],
                document,
                projectName,
                'Task'
            );

            this.logger.log(LogLevel.Information, `Created task '${title}' with ID ${createdTask.id} under work item #${parentWorkItemId}.`);
        } catch (error) {
            const errorMessage = (error as Error).message;
            this.logger.log(LogLevel.Error, `Failed to create task '${title}': ${errorMessage}`);
            throw error;
        }
    }

    public async updateWorkItemState(workItemId: number, newState: string): Promise<void> {
        const workItemTrackingClient = await this.getWorkItemTrackingClient();
        if (!workItemTrackingClient) {
            return;
        }

        const projectName = await this.devOpsService.getProjectName();
        if (!projectName) {
            window.showErrorMessage("Azure DevOps project is not configured. Commands that require it will not work.");
            this.logger.log(LogLevel.Error, "Azure DevOps project is not configured. Commands that require it will not work.");
            return;
        }

        const document = [
            {
                op: "replace",
                path: "/fields/System.State",
                value: newState
            }
        ];

        try {
            await workItemTrackingClient.updateWorkItem(
                [],
                document,
                workItemId,
                projectName
            );

            this.logger.log(LogLevel.Information, `Successfully updated work item #${workItemId} state to '${newState}'.`);
        } catch (error) {
            const errorMessage = (error as Error).message;
            this.logger.log(LogLevel.Error, `Failed to update work item #${workItemId} state to '${newState}': ${errorMessage}`);
            throw error;
        }
    }

    public async getAvailableStates(workItemType: WorkItemType): Promise<WorkItemState[]> {
        const workItemTrackingClient = await this.getWorkItemTrackingClient();
        if (!workItemTrackingClient) {
            return [];
        }

        const projectName = await this.devOpsService.getProjectName();
        if (!projectName) {
            this.logger.log(LogLevel.Error, "Azure DevOps project is not configured. Cannot get available states.");
            return [];
        }

        try {
            const workItemTypeDefinition = await workItemTrackingClient.getWorkItemType(projectName, workItemType.name);
            const stateField = workItemTypeDefinition.fields?.find(field => field.referenceName === 'System.State');
            if (stateField && stateField.allowedValues) {
                return stateField.allowedValues.map(value => new WorkItemState(value.toString()));
            }

            this.logger.log(LogLevel.Warning, `Could not retrieve available states for work item type '${workItemType}'. Using fallback states.`);
            return [ WorkItemState.ToDo, WorkItemState.Doing, WorkItemState.Done ];
        } catch (error) {
            this.logger.log(LogLevel.Error, `Failed to get available states for work item type '${workItemType}': ${(error as Error).message}`);
            return [ WorkItemState.ToDo, WorkItemState.Doing, WorkItemState.Done ];
        }
    }

    private async getWorkItemTrackingClient(): Promise<WorkItemTrackingApi | null> {
        const organizationUri = await this.devOpsService.getOrganizationUri();
        if (!organizationUri) {
            window.showErrorMessage("Unable to access Azure DevOps without an organization configured.");
            this.logger.log(LogLevel.Error, "Unable to access Azure DevOps without an organization configured.");
            return null;
        }

        const personalAccessToken = await this.devOpsService.getPersonalAccessToken();
        if (!personalAccessToken) {
            window.showErrorMessage("Unable to access Azure DevOps without a personal access token configured.");
            this.logger.log(LogLevel.Error, "Unable to access Azure DevOps without a personal access token configured.");
            return null;
        }

        const authenticationHandler = devops.getPersonalAccessTokenHandler(personalAccessToken);
        const connection = new WebApi(organizationUri, authenticationHandler);
        return await connection.getWorkItemTrackingApi();
    }
}