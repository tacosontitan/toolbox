import * as vscode from 'vscode';
import { IConfigurationProvider, ISecretProvider } from "../core/configuration";
import { DevOpsCommand } from '../core/devops-command';
import { TasksTreeDataProvider } from '../providers/tasks-tree-data-provider';

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