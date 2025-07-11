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
        // This command is no longer supported with the new active work items view
        vscode.window.showErrorMessage('Add Task is not supported in the Active Work Items view. Tasks should be managed directly in Azure DevOps.');
    }
}