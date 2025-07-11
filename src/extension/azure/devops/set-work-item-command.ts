import * as vscode from 'vscode';
import { IConfigurationProvider, ISecretProvider } from "../../core/configuration";
import { DevOpsCommand } from './devops-command';
import { TasksTreeDataProvider } from './tasks-tree-data-provider';
import { DevOpsService } from './devops-service';

/**
 * Command to search for work items.
 */
export class SetWorkItemCommand extends DevOpsCommand {
    constructor(
        secretProvider: ISecretProvider,
        configurationProvider: IConfigurationProvider,
        private tasksTreeProvider: TasksTreeDataProvider,
        private devOpsService: DevOpsService
    ) {
        super('searchWorkItem', secretProvider, configurationProvider);
    }

    async execute(...args: any[]): Promise<void> {
        const searchTerm = await vscode.window.showInputBox({ 
            prompt: 'Enter work item number or search term',
            placeHolder: 'e.g., 12345 or "user authentication"'
        });

        if (!searchTerm || searchTerm.trim() === '') {
            return;
        }

        // Check if it's a number (work item ID)
        const workItemNumber = parseInt(searchTerm.trim());
        if (!isNaN(workItemNumber) && workItemNumber > 0) {
            // Open the work item in browser
            try {
                const organizationUri = await this.devOpsService.getOrganizationUri();
                const projectName = await this.devOpsService.getProjectName();
                
                if (organizationUri && projectName) {
                    const workItemUrl = `${organizationUri}/${encodeURIComponent(projectName)}/_workitems/edit/${workItemNumber}`;
                    await vscode.env.openExternal(vscode.Uri.parse(workItemUrl));
                } else {
                    vscode.window.showErrorMessage('Azure DevOps configuration is incomplete. Cannot open work item.');
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to open work item: ${(error as Error).message}`);
            }
        } else {
            // For now, just show a message about text search not being implemented yet
            vscode.window.showInformationMessage(`Text search for "${searchTerm}" is not yet implemented. Use work item numbers for now.`);
        }
    }
}