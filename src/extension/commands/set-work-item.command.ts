import * as vscode from 'vscode';
import { Command } from '../core/command';
import { ConfigurationError, ConfigurationManager } from "../core/configuration";
import { TasksTreeDataProvider } from '../providers/tasks-tree-data-provider';

/**
 * Command to search for work items.
 * REFACTORED: Now uses ConfigurationManager for automatic validation!
 */
export class SetWorkItemCommand extends Command {
    constructor(
        private readonly configurationManager: ConfigurationManager,
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
                // 🎯 BEFORE: Manual validation with multiple DevOpsService calls
                // 🎯 AFTER: One method call with automatic validation!
                const config = await this.configurationManager.getAzureDevOpsConfiguration();
                
                const workItemUrl = `${config.organization}/${encodeURIComponent(config.project)}/_workitems/edit/${workItemNumber}`;
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