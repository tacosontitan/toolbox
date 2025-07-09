import { IConfigurationProvider, ISecretProvider } from "../../../core/configuration";
import { ILogger, LogLevel } from "../../../core/telemetry";
import { WorkItem } from "../../../core/workflow";
import { DevOpsCommand } from "../devops-command";

export class StartWorkItemCommand
    extends DevOpsCommand {

    constructor(
        private readonly logger: ILogger,
        secretProvider: ISecretProvider,
        configurationProvider: IConfigurationProvider
    ) {
        super('startWorkItem', secretProvider, configurationProvider);
    }

    /** @inheritdoc */
    public async execute(): Promise<void> {
        const workItemNumber = await assistant.promptUser("Enter the work item number:");
        if (!workItemNumber) {
            this.logger.log(LogLevel.Warning, "No work item number provided. Exiting.");
            return;
        }

        const workItem: WorkItem | null = await this.loadWorkItemDetails(workItemNumber);
        if (!workItem) {
            this.logger.log(LogLevel.Error, `Work item #${workItemNumber} not found. Exiting."`);
            return;
        }

        const confirm = await assistant.confirmUser(`Do you want to start work item #${workItemNumber} - ${workItem.title}?`);
        if (!confirm) {
            this.logger.log(LogLevel.Warning, "User declined to start the work item. Exiting.");
            return;
        }

        await this.changeWorkItemState(workItem, "Planning");

        try {
            const branchName = `feature/${workItemNumber}-${workItem.title.replace(/\s+/g, '-').toLowerCase()}`;
            await assistant.sourceControl.createBranchFromMain(branchName);
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