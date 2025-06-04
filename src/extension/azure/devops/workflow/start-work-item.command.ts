import { IAssistant } from "../../../assistant";
import { GitHelper } from "../../../utils/git-helper";
import { DevOpsCommand } from "../devops-command";
import { IWorkItem } from "../work-item-type";

export class StartWorkItemCommand
    extends DevOpsCommand {

    /** @inheritdoc */
    public async execute(assistant: IAssistant, ...args: any[]): Promise<void> {
        // Step 1: Prompt the user for the work item number
        const workItemNumber = await assistant.promptUser("Enter the work item number:");
        if (!workItemNumber) {
            assistant.log("No work item number provided. Exiting.");
            return;
        }

        // Step 2: Load the work item details
        const workItem: IWorkItem | null = await this.loadWorkItemDetails(workItemNumber);
        if (!workItem) {
            assistant.log(`Work item #${workItemNumber} not found. Exiting."`);
            return;
        }

        // Step 3: Confirm with the user
        const confirm = await assistant.confirmUser(`Do you want to start work item #${workItemNumber} - ${workItem.title}?`);
        if (!confirm) {
            assistant.log("User declined to start the work item. Exiting.");
            return;
        }

        // Step 5: Change the work item to a planning state
        await this.changeWorkItemState(workItem, "Planning");

        // Step 6: Create a new branch for the work item
        const branchName = `feature/${workItemNumber}-${workItem.title.replace(/\s+/g, '-').toLowerCase()}`;
        const gitHelper = new GitHelper();

        try {
            // 6a: Switch to the main branch and pull latest changes
            await gitHelper.checkoutBranch("main");
            await gitHelper.pullLatestChanges();

            // 6b: Stash any changes
            await gitHelper.stashChanges();

            // 6: Create and switch to the new branch
            await gitHelper.createBranch(branchName);

            // 6c: Pop the stashed changes
            await gitHelper.popStashedChanges();

            // 6d: Publish the new branch
            await gitHelper.publishBranch(branchName);

            assistant.log(`Branch '${branchName}' created and published successfully.`);
        } catch (error) {
            assistant.log(`Error during branch creation: ${error.message}`);
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