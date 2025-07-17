import { IConfiguration } from "../../core";
import { IRepository } from "../../core/repository";
import { ILogger, LogLevel } from "../../core/telemetry";
import { WorkflowOptions, WorkItem } from "../../domain/workflow";
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
        private readonly workItemRepository: IRepository<WorkItem>
    ) { }

    /** @inheritdoc */
    public async start(workItemId: number): Promise<void> {
        this.logger.log(LogLevel.Trace, `Attempting to start work item ${workItemId}.`);
        const workItem: WorkItem | undefined = await this.workItemRepository.getById(workItemId);
        if (!workItem) {
            throw new Error(`Unable to locate work item ${workItemId}.`);
        }

        const workflowOptions: WorkflowOptions = await this.workflowConfiguration.get();
        workItem.start(workflowOptions.workItemStartedState);
        await this.workItemRepository.update(workItem);

        this.logger.log(LogLevel.Information, `Work item ${workItemId} has been started.`);
    }
}