import { Command } from "../../../core/command";
import { ICommunicationService } from "../../../core/communication";
import { ILogger, LogLevel } from "../../../core/telemetry";
import { IWorkflowService } from "../../../domain/workflow/workflow.service.interface";

/**
 * Starts a work item on behalf of the user.
 */
export class StartWorkItemCommand extends Command {

    /**
     * @constructor
     * @param logger The service used to capture errors and diagnostic messaging.
     * @param communicationService The service used to communicate with the user directly.
     * @param workflowService The service used to manage workflow operations.
     */
    constructor(
        private readonly logger: ILogger,
        private readonly communicationService: ICommunicationService,
        private readonly workflowService: IWorkflowService
    ) {
        super('workflow.startWorkItem');
    }

    /** @inheritdoc */
    public async execute(): Promise<void> {
        try {
            const workItemNumber = await this.communicationService.prompt<number>(`🔍 What is the number of the work item you'd like to start?`);
            if (!workItemNumber) {
                this.logger.log(LogLevel.Warning, "No work item number provided.");
                return;
            }

            await this.workflowService.start(workItemNumber);
        } catch (error) {
            this.logger.logError("Failed to start work item.", error);
        }
    }
}