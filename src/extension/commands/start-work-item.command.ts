import { Command } from "../core/command";
import { ICommunicationService } from "../core/communication";
import { IConfigurationProvider, ISecretProvider } from "../core/configuration";
import { ISourceControlService } from "../core/source-control/source-control.service";
import { ILogger, LogLevel } from "../core/telemetry";
import { IWorkItemService, WorkItem } from "../core/workflow";

export class StartWorkItemCommand
    extends Command {

    constructor(
        private readonly secretProvider: ISecretProvider,
        private readonly configurationProvider: IConfigurationProvider,
        private readonly logger: ILogger,
        private readonly communicationService: ICommunicationService,
        private readonly sourceControlService: ISourceControlService,
        private readonly workItemService: IWorkItemService
    ) {
        super('startWorkItem');
    }

    /** @inheritdoc */
    public async execute(): Promise<void> {
        const workItemNumber = await this.communicationService.prompt<number>(`Enter the work item number:`);
        if (!workItemNumber) {
            this.logger.log(LogLevel.Warning, "No work item number provided.");
            return;
        }

        const workItem: WorkItem | null = await this.workItemService.start(workItemNumber);
        if (!workItem) {
            this.logger.log(LogLevel.Error, `Unable to start work item #${workItemNumber}.`);
            return;
        }

        //await this.createTopicBranch(workItem);
    }

    private async createTopicBranch(workItem: WorkItem): Promise<void> {
        try {
            const branchName = `feature/${workItem.id}-${workItem.title.replace(/\s+/g, '-').toLowerCase()}`;
            await this.sourceControlService.createBranchFromMain(branchName);
            this.logger.log(LogLevel.Information, `Branch '${branchName}' created and published successfully.`);
        } catch (error) {
            if (error instanceof Error) {
                this.logger.log(LogLevel.Error, `Error during branch creation: ${error.message}`);
            } else {
                this.logger.log(LogLevel.Error, "An unknown error occurred during branch creation.");
            }
        }
    }
}