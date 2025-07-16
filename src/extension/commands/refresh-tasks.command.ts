import * as vscode from 'vscode';
import { Command } from '../core/command';
import { IConfigurationProvider, ISecretProvider } from "../core/configuration";
import { TasksTreeDataProvider } from '../providers/tasks-tree-data-provider';

/**
 * Command to refresh the tasks tree view.
 */
export class RefreshTasksCommand extends Command {
    constructor(
        private readonly secretProvider: ISecretProvider,
        private readonly configurationProvider: IConfigurationProvider,
        private tasksTreeProvider: TasksTreeDataProvider
    ) {
        super('refreshTasks');
    }

    async execute(...args: any[]): Promise<void> {
        this.tasksTreeProvider.refresh();
        vscode.window.showInformationMessage('Tasks tree view refreshed');
    }
}