import { IAssistant } from "../../../assistant";
import { LogLevel } from "../../../telemetry";
import { DevOpsCommand } from "../devops-command";
import { IWorkItem } from "../work-item-type";

export class StartWorkItemCommand
    extends DevOpsCommand {

    /** @inheritdoc */
    public async execute(assistant: IAssistant, ...args: any[]): Promise<void> {
        // Step 1: Prompt the user for the work item number
        const workItemNumber = await assistant.promptUser("Enter the work item number:");
        if (!workItemNumber) {
            assistant.logger.log(LogLevel.Warning, "No work item number provided. Exiting.");
            return;
        }

        // Step 2: Load the work item details
        const workItem: IWorkItem | null = await this.loadWorkItemDetails(workItemNumber);
        if (!workItem) {
            assistant.logger.log(LogLevel.Error, `Work item #${workItemNumber} not found. Exiting."`);
            return;
        }

        // Step 3: Confirm with the user
        const confirm = await assistant.confirmUser(`Do you want to start work item #${workItemNumber} - ${workItem.title}?`);
        if (!confirm) {
            assistant.logger.log(LogLevel.Warning, "User declined to start the work item. Exiting.");
            return;
        }

        // Step 5: Change the work item to a planning state
        await this.changeWorkItemState(workItem, "Planning");

        // Step 6: Create a new branch for the work item
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

    private async loadWorkItemDetails(workItemNumber: string): Promise<IWorkItem | null> {
        // Placeholder for loading work item details
        return null; // Replace with actual implementation
    }

    private async changeWorkItemState(workItem: IWorkItem, state: string): Promise<void> {
        // Placeholder for changing work item state
        // Replace with actual implementation
    }
}