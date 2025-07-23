import { IConfiguration } from "../../core";
import { IRepository } from "../../core/repository";
import { ILogger, LogLevel } from "../../core/telemetry";
import { ITaskService, WorkflowOptions, WorkItem } from "../../domain/workflow";
import { IWorkflowService } from "../../domain/workflow/workflow.service.interface";

/** @inheritdoc */
export class WorkflowService implements IWorkflowService {

    /**
     * @constructor
     * @param logger The service used to capture errors and diagnostic messaging.
     * @param workflowConfiguration The configuration service for workflow options.
     * @param workItemRepository The repository used to manage work items.
     */
    constructor(
        private readonly logger: ILogger,
        private readonly workflowConfiguration: IConfiguration<WorkflowOptions>,
        private readonly workItemRepository: IRepository<WorkItem>,
        private readonly taskService: ITaskService
    ) { }

    /** @inheritdoc */
    public async start(workItemId: number): Promise<void> {
        this.logger.log(LogLevel.Trace, `Attempting to start work item ${workItemId}.`);

        // Get the work item
        const workItem: WorkItem | undefined = await this.workItemRepository.getById(workItemId);
        if (!workItem) {
            throw new Error(`Unable to locate work item ${workItemId}.`);
        }

        // Get workflow configuration
        const workflowOptions: WorkflowOptions = await this.workflowConfiguration.get();

        // Start the work item (domain logic - just state change)
        workItem.start(workflowOptions.workItemStartedState);

        // Get default tasks for this work item (application logic - business process)
        const defaultTasks: WorkItem[] = this.taskService.getDefaultTasksForWorkItem(workItem);

        // Add default tasks as children
        for (const task of defaultTasks) {
            workItem.addChild(task);
        }

        // Persist changes
        await this.workItemRepository.update(workItem);

        // Create the child tasks in the repository
        for (const child of workItem.children) {
            await this.workItemRepository.create(child);
        }

        this.logger.log(LogLevel.Information, `Work item ${workItemId} has been started with ${defaultTasks.length} default tasks.`);
    }
}