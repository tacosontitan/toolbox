import * as vscode from 'vscode';
import { Command } from '../core/command';
import { ConfigurationManager } from "../core/configuration";
import { TasksTreeDataProvider } from '../providers/tasks-tree-data-provider';

/**
 * Command to refresh the tasks tree view.
 * REFACTORED: Simplified dependencies by using ConfigurationManager!
 */
export class RefreshTasksCommand extends Command {
    constructor(
        private readonly configurationManager: ConfigurationManager,
        private tasksTreeProvider: TasksTreeDataProvider
    ) {
        super('refreshTasks');
    }

    async execute(...args: any[]): Promise<void> {
        this.tasksTreeProvider.refresh();
        vscode.window.showInformationMessage('Tasks tree view refreshed');
    }
}