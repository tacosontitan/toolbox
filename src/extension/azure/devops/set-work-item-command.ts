import * as vscode from 'vscode';
import { IConfigurationProvider, ISecretProvider } from "../../core/configuration";
import { DevOpsCommand } from './devops-command';
import { TasksTreeDataProvider } from './tasks-tree-data-provider';

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
        // This command is no longer supported with the new active work items view
        vscode.window.showErrorMessage('Set Work Item is not supported. The Active Work Items view automatically shows all assigned work items.');
    }
}