import * as devops from "azure-devops-node-api";
import { window } from "vscode";

import { WebApi } from 'azure-devops-node-api/WebApi';
import { WorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';

import { ICommunicationService } from "../../../core/communication";
import { ILogger, LogLevel } from "../../../core/telemetry";
import { IWorkItemService, WorkItem, WorkItemState, WorkItemType } from "../../../core/workflow";
import { DevOpsService } from "../devops-service";
import { DefaultTasks } from "./default-tasks";
import { PreDefinedTaskJsonPatchDocumentMapper } from "./pre-defined-tasks/pre-defined-task-json-patch-document-mapper";

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
            const organizationUri = await this.devOpsService.getOrganizationUri();
            if (!organizationUri) {
                window.showErrorMessage("Unable to query work item details without an Azure DevOps organization configured.");
                this.logger.log(LogLevel.Error, "Unable to query work item details without an Azure DevOps organization configured.");
                return null;
            }

            const personalAccessToken = await this.devOpsService.getPersonalAccessToken();
            if (!personalAccessToken) {
                window.showErrorMessage("Unable to query work item details without a personal access token configured.");
                this.logger.log(LogLevel.Error, "Unable to query work item details without a personal access token configured.");
                return null;
            }

            const authenticationHandler = devops.getPersonalAccessTokenHandler(personalAccessToken);
            const connection = new WebApi(organizationUri, authenticationHandler);
            const workItemTrackingClient: WorkItemTrackingApi = await connection.getWorkItemTrackingApi();
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
            const organizationUri = await this.devOpsService.getOrganizationUri();
            if (!organizationUri) {
                window.showErrorMessage("Unable to change work item state without an Azure DevOps organization configured.");
                this.logger.log(LogLevel.Error, "Unable to change work item state without an Azure DevOps organization configured.");
                return;
            }

            const personalAccessToken = await this.devOpsService.getPersonalAccessToken();
            if (!personalAccessToken) {
                window.showErrorMessage("Unable to change work item state without a personal access token configured.");
                this.logger.log(LogLevel.Error, "Unable to change work item state without a personal access token configured.");
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

            const authenticationHandler = devops.getPersonalAccessTokenHandler(personalAccessToken);
            const connection = new WebApi(organizationUri, authenticationHandler);
            const workItemTrackingClient: WorkItemTrackingApi = await connection.getWorkItemTrackingApi();
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
        const organizationUri = await this.devOpsService.getOrganizationUri();
        if (!organizationUri) {
            window.showErrorMessage("Unable to create default tasks without an Azure DevOps organization configured.");
            this.logger.log(LogLevel.Error, "Unable to create default tasks without an Azure DevOps organization configured.");
            return;
        }

        const personalAccessToken = await this.devOpsService.getPersonalAccessToken();
        if (!personalAccessToken) {
            window.showErrorMessage("Unable to create default tasks without a personal access token configured.");
            this.logger.log(LogLevel.Error, "Unable to create default tasks without a personal access token configured.");
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

        const authenticationHandler = devops.getPersonalAccessTokenHandler(personalAccessToken);
        const connection = new WebApi(organizationUri, authenticationHandler);
        const workItemTrackingClient: WorkItemTrackingApi = await connection.getWorkItemTrackingApi();
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
}