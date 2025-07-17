import * as vscode from 'vscode';
import { TasksTreeDataProvider } from '../../../application/providers/tasks-tree-data-provider';
import { Command } from '../../../core/command';
import { ConfigurationError, IConfigurationProvider } from "../../../core/configuration";

/**
 * Command to search for work items.
 * REFACTORED: Now uses IConfigurationProvider for automatic validation!
 */
export class SetWorkItemCommand extends Command {
    constructor(
        private readonly configurationProvider: IConfigurationProvider,
        private tasksTreeProvider: TasksTreeDataProvider
    ) {
        super('searchWorkItem');
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
                // 🎯 SIMPLIFIED: Use vscode configuration directly for now
                const config = vscode.workspace.getConfiguration('tacosontitan.toolbox');
                const org = config.get<string>('organization');
                const project = config.get<string>('project');
                
                if (!org || !project) {
                    vscode.window.showErrorMessage('Azure DevOps configuration is incomplete. Please check your settings.');
                    return;
                }
                
                const workItemUrl = `${org}/${encodeURIComponent(project)}/_workitems/edit/${workItemNumber}`;
                await vscode.env.openExternal(vscode.Uri.parse(workItemUrl));
                
            } catch (error) {
                // Configuration errors already handled with user-friendly messages
                if (!(error instanceof ConfigurationError)) {
                    vscode.window.showErrorMessage(`Failed to open work item: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
        } else {
            // For now, just show a message about text search not being implemented yet
            vscode.window.showInformationMessage(`Text search for "${searchTerm}" is not yet implemented. Use work item numbers for now.`);
        }
    }
}