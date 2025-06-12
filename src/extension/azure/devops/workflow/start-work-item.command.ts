import { IAssistant } from "../../../assistant";
import { LogLevel } from "../../../telemetry";
import { IWorkItem } from "../../../workflow/work-item-type";
import { DevOpsCommand } from "../devops-command";

export class StartWorkItemCommand
    extends DevOpsCommand {

    /** @inheritdoc */
    public async execute(assistant: IAssistant, ...args: any[]): Promise<void> {
        const workItemNumber = await assistant.promptUser("Enter the work item number:");
        if (!workItemNumber) {
            assistant.logger.log(LogLevel.Warning, "No work item number provided. Exiting.");
            return;
        }

        const workItem: IWorkItem | null = await this.loadWorkItemDetails(workItemNumber);
        if (!workItem) {
            assistant.logger.log(LogLevel.Error, `Work item #${workItemNumber} not found. Exiting."`);
            return;
        }

        const confirm = await assistant.confirmUser(`Do you want to start work item #${workItemNumber} - ${workItem.title}?`);
        if (!confirm) {
            assistant.logger.log(LogLevel.Warning, "User declined to start the work item. Exiting.");
            return;
        }

        await this.changeWorkItemState(workItem, "Planning");

        try {
            const branchName = `feature/${workItemNumber}-${workItem.title.replace(/\s+/g, '-').toLowerCase()}`;
            await assistant.sourceControl.createBranchFromMain(branchName);
            assistant.logger.log(LogLevel.Information, `Branch '${branchName}' created and published successfully.`);
        } catch (error) {
            if (error instanceof Error) {
                assistant.logger.log(LogLevel.Error, `Error during branch creation: ${error.message}`);
            } else {
                assistant.logger.log(LogLevel.Error, "An unknown error occurred during branch creation.");
            }
        }
    }
}