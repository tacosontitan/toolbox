import * as vscode from 'vscode';
import { IAssistant } from '../../assistant';
import { DevOpsCommand } from './devops-command';
import { TasksTreeDataProvider } from './tasks-tree-provider';

/**
 * Command to set the work item number for the tasks tree view.
 */
export class SetWorkItemCommand extends DevOpsCommand {
    constructor(private tasksTreeProvider: TasksTreeDataProvider) {
        super('setWorkItem');
    }

    async execute(assistant: IAssistant, ...args: any[]): Promise<void> {
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
    constructor(private tasksTreeProvider: TasksTreeDataProvider) {
        super('refreshTasks');
    }

    async execute(assistant: IAssistant, ...args: any[]): Promise<void> {
        this.tasksTreeProvider.refresh();
        vscode.window.showInformationMessage('Tasks tree view refreshed');
    }
}