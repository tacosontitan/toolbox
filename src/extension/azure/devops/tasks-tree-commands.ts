import * as vscode from 'vscode';
import { IConfigurationProvider, ISecretProvider } from "../../core/configuration";
import { DevOpsCommand } from './devops-command';
import { DevOpsService } from './devops-service';
import { TasksTreeDataProvider } from './tasks-tree-provider';

/**
 * Command to set the work item number for the tasks tree view.
 */
export class SetWorkItemCommand extends DevOpsCommand {
    constructor(
        secretProvider: ISecretProvider,
        configurationProvider: IConfigurationProvider,
        private tasksTreeProvider: TasksTreeDataProvider
    ) {
        super('setWorkItem', secretProvider, configurationProvider);
    }

    async execute(...args: any[]): Promise<void> {
        const workItemNumberResponse = await vscode.window.showInputBox({ 
            prompt: 'Enter the work item number to view its tasks',
            placeHolder: 'e.g., 12345'
        });

        const workItemNumber = parseInt(workItemNumberResponse ?? '-1');
        if (isNaN(workItemNumber) || workItemNumber <= 0) {
            vscode.window.showErrorMessage('Please enter a valid work item number.');
            return;
        }

        await this.tasksTreeProvider.setWorkItem(workItemNumber);
        vscode.window.showInformationMessage(`Tasks tree view updated for work item #${workItemNumber}`);
    }
}

/**
 * Command to refresh the tasks tree view.
 */
export class RefreshTasksCommand extends DevOpsCommand {
    constructor(
        secretProvider: ISecretProvider,
        configurationProvider: IConfigurationProvider,
        private tasksTreeProvider: TasksTreeDataProvider
    ) {
        super('refreshTasks', secretProvider, configurationProvider);
    }

    async execute(...args: any[]): Promise<void> {
        this.tasksTreeProvider.refresh();
        vscode.window.showInformationMessage('Tasks tree view refreshed');
    }
}