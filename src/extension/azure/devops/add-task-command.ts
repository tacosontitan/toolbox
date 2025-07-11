import * as vscode from 'vscode';
import { IConfigurationProvider, ISecretProvider } from "../../core/configuration";
import { DevOpsCommand } from './devops-command';
import { TasksTreeDataProvider } from './tasks-tree-data-provider';
import { IWorkItemService } from '../../core/workflow';

/**
 * Command to add a new task to the current work item.
 */
export class AddTaskCommand extends DevOpsCommand {
    constructor(
        secretProvider: ISecretProvider,
        configurationProvider: IConfigurationProvider,
        private tasksTreeProvider: TasksTreeDataProvider,
        private workItemService: IWorkItemService
    ) {
        super('addTask', secretProvider, configurationProvider);
    }

    async execute(...args: any[]): Promise<void> {
        const currentWorkItemId = this.tasksTreeProvider.getCurrentWorkItemId();
        if (!currentWorkItemId) {
            vscode.window.showErrorMessage('No work item selected. Please set a work item first.');
            return;
        }

        const title = await vscode.window.showInputBox({
            prompt: 'Enter the title for the new task',
            placeHolder: 'e.g., Implement user authentication'
        });

        if (!title || title.trim() === '') {
            return;
        }

        const description = await vscode.window.showInputBox({
            prompt: 'Enter a description for the task (optional)',
            placeHolder: 'Detailed description of the task...'
        });

        try {
            await this.workItemService.createTask(currentWorkItemId, title.trim(), description?.trim() || '');
            vscode.window.showInformationMessage(`Task "${title}" created successfully`);
            this.tasksTreeProvider.refresh();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create task: ${(error as Error).message}`);
        }
    }
}