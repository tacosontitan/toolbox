import * as vscode from 'vscode';
import { TasksTreeDataProvider } from '../../../application/providers/tasks-tree-data-provider';
import { Command } from '../../../core/command';
import { IConfigurationProvider } from "../../../core/configuration";

/**
 * Command to refresh the tasks tree view.
 * REFACTORED: Simplified dependencies by using IConfigurationProvider!
 */
export class RefreshTasksCommand extends Command {
    constructor(
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