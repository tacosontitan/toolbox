import * as vscode from 'vscode';
import { IConfigurationProvider, ISecretProvider } from "../../core/configuration";
import { DevOpsCommand } from './devops-command';
import { TasksTreeDataProvider } from './tasks-tree-data-provider';
import { TaskTreeItem } from './task-tree-item';
import { IWorkItemService } from '../../core/workflow';

/**
 * Command to change the state of a task.
 */
export class ChangeTaskStateCommand extends DevOpsCommand {
    constructor(
        secretProvider: ISecretProvider,
        configurationProvider: IConfigurationProvider,
        private tasksTreeProvider: TasksTreeDataProvider,
        private workItemService: IWorkItemService
    ) {
        super('changeTaskState', secretProvider, configurationProvider);
    }

    async execute(taskItem?: TaskTreeItem): Promise<void> {
        if (!taskItem) {
            vscode.window.showErrorMessage('No task selected');
            return;
        }

        const availableStates = ['New', 'Active', 'Resolved', 'Closed'];
        const currentState = taskItem.task.fields?.['System.State'];
        
        const newState = await vscode.window.showQuickPick(
            availableStates.filter(state => state !== currentState),
            {
                placeHolder: `Current state: ${currentState}. Select new state:`
            }
        );

        if (!newState) {
            return;
        }

        try {
            await this.workItemService.updateWorkItemState(taskItem.task.id!, newState);
            vscode.window.showInformationMessage(`Task state changed to ${newState}`);
            this.tasksTreeProvider.refresh();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to update task state: ${(error as Error).message}`);
        }
    }
}