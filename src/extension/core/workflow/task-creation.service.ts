import { WorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';
import { WorkItem } from '../workflow/work-item';
import { ILogger, LogLevel } from '../telemetry';
import { DevOpsService } from '../../azure/devops/devops-service';
import { AzureDevOpsValidationService } from '../validation/azure-devops-validation.service';
import { PreDefinedTaskJsonPatchDocumentMapper } from '../../azure/devops/workflow/pre-defined-tasks/pre-defined-task-json-patch-document-mapper';
import { DefaultTasks } from '../../azure/devops/workflow/default-tasks';

/**
 * Domain service specifically for task creation operations.
 * Separates task creation logic from the main work item service.
 */
export class TaskCreationService {
    private readonly validationService: AzureDevOpsValidationService;

    constructor(
        private readonly logger: ILogger,
        private readonly devOpsService: DevOpsService
    ) {
        this.validationService = new AzureDevOpsValidationService(logger);
    }

    /**
     * Creates default tasks for a work item.
     */
    async createDefaultTasks(workItem: WorkItem, client: WorkItemTrackingApi): Promise<void> {
        const config = await this.getRequiredConfiguration();
        if (!this.validationService.validateConfiguration(config, 'create default tasks')) {
            return;
        }

        const { organizationUri, projectName, userDisplayName } = config;
        const taskMapper = new PreDefinedTaskJsonPatchDocumentMapper(
            userDisplayName!,
            organizationUri!,
            workItem.id || -1,
            workItem.areaPath || "",
            workItem.iterationPath || ""
        );

        for (const task of DefaultTasks) {
            try {
                const patchDocument = taskMapper.map(task);
                const createdTask = await client.createWorkItem(
                    [],
                    patchDocument,
                    projectName!,
                    'Task'
                );

                this.logger.log(LogLevel.Debug, `Created task '${task.name}' with ID ${createdTask.id} under work item #${workItem.id}.`);
            } catch (error) {
                this.validationService.handleApiError(error as Error, `create task '${task.name}'`, workItem.id);
            }
        }
    }

    /**
     * Creates a single task for a parent work item.
     */
    async createTask(parentWorkItemId: number, title: string, description: string, client: WorkItemTrackingApi): Promise<void> {
        if (!this.validationService.validateWorkItemId(parentWorkItemId, 'create task')) {
            return;
        }

        const config = await this.getRequiredConfiguration();
        if (!this.validationService.validateConfiguration(config, 'create task')) {
            return;
        }

        const { organizationUri, projectName } = config;
        const { parentAreaPath, parentIterationPath } = await this.getParentWorkItemPaths(parentWorkItemId, client);
        const defaultTaskState = await this.devOpsService.getDefaultTaskState();

        const document = [
            { op: "add", path: "/fields/System.Title", value: title },
            { op: "add", path: "/fields/System.Description", value: description },
            { op: "add", path: "/fields/System.AreaPath", value: parentAreaPath },
            { op: "add", path: "/fields/System.IterationPath", value: parentIterationPath },
            { op: "add", path: "/fields/System.State", value: defaultTaskState },
            {
                op: "add",
                path: "/relations/-",
                value: {
                    rel: "System.LinkTypes.Hierarchy-Reverse",
                    url: `${organizationUri}/${projectName}/_apis/wit/workItems/${parentWorkItemId}`,
                    attributes: { comment: "Child task" }
                }
            }
        ];

        try {
            const createdTask = await client.createWorkItem([], document, projectName!, 'Task');
            this.logger.log(LogLevel.Information, `Successfully created task '${title}' with ID ${createdTask.id}.`);
        } catch (error) {
            this.validationService.handleApiError(error as Error, 'create task', parentWorkItemId);
            throw error;
        }
    }

    /**
     * Gets required configuration for task operations.
     */
    private async getRequiredConfiguration() {
        return {
            organizationUri: await this.devOpsService.getOrganizationUri(),
            projectName: await this.devOpsService.getProjectName(),
            userDisplayName: await this.devOpsService.getUserDisplayName()
        };
    }

    /**
     * Gets area and iteration paths from parent work item.
     */
    private async getParentWorkItemPaths(parentWorkItemId: number, client: WorkItemTrackingApi): Promise<{ parentAreaPath: string; parentIterationPath: string }> {
        try {
            const parentWorkItem = await client.getWorkItem(parentWorkItemId);
            return {
                parentAreaPath: parentWorkItem.fields?.['System.AreaPath'] as string || "",
                parentIterationPath: parentWorkItem.fields?.['System.IterationPath'] as string || ""
            };
        } catch (error) {
            this.logger.log(LogLevel.Warning, `Could not retrieve parent work item ${parentWorkItemId} for area/iteration paths: ${(error as Error).message}`);
            return { parentAreaPath: "", parentIterationPath: "" };
        }
    }
}