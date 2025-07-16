import * as vscode from 'vscode';
import { TaskTreeItem } from '../azure/devops/task-tree-item';
import { IConfigurationProvider, ISecretProvider } from "../core/configuration";
import { IWorkItemService } from '../core/workflow';
import { TasksTreeDataProvider } from '../providers/tasks-tree-data-provider';
import { DevOpsCommand } from './devops-command';

/**
 * Base command to set task state to a specific value.
 */
export abstract class SetTaskStateCommand extends DevOpsCommand {
    constructor(
        commandSuffix: string,
        secretProvider: ISecretProvider,
        configurationProvider: IConfigurationProvider,
        protected tasksTreeProvider: TasksTreeDataProvider,
        protected workItemService: IWorkItemService,
        protected targetState: string
    ) {
        super(`setTaskStateTo${commandSuffix}`, secretProvider, configurationProvider);
    }

    async execute(taskItem?: TaskTreeItem): Promise<void> {
        if (!taskItem) {
            vscode.window.showErrorMessage('No task selected');
            return;
        }

        try {
            await this.workItemService.updateWorkItemState(taskItem.task.id!, this.targetState);
            vscode.window.showInformationMessage(`Task state changed to ${this.targetState}`);
            this.tasksTreeProvider.refresh();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to update task state: ${(error as Error).message}`);
        }
    }
}

/**
 * Command to set task state to New.
 */
export class SetTaskStateToNewCommand extends SetTaskStateCommand {
    constructor(
        secretProvider: ISecretProvider,
        configurationProvider: IConfigurationProvider,
        tasksTreeProvider: TasksTreeDataProvider,
        workItemService: IWorkItemService
    ) {
        super('New', secretProvider, configurationProvider, tasksTreeProvider, workItemService, 'New');
    }
}

/**
 * Command to set task state to Active.
 */
export class SetTaskStateToActiveCommand extends SetTaskStateCommand {
    constructor(
        secretProvider: ISecretProvider,
        configurationProvider: IConfigurationProvider,
        tasksTreeProvider: TasksTreeDataProvider,
        workItemService: IWorkItemService
    ) {
        super('Active', secretProvider, configurationProvider, tasksTreeProvider, workItemService, 'Active');
    }
}

/**
 * Command to set task state to Resolved.
 */
export class SetTaskStateToResolvedCommand extends SetTaskStateCommand {
    constructor(
        secretProvider: ISecretProvider,
        configurationProvider: IConfigurationProvider,
        tasksTreeProvider: TasksTreeDataProvider,
        workItemService: IWorkItemService
    ) {
        super('Resolved', secretProvider, configurationProvider, tasksTreeProvider, workItemService, 'Resolved');
    }
}

/**
 * Command to set task state to Closed.
 */
export class SetTaskStateToClosedCommand extends SetTaskStateCommand {
    constructor(
        secretProvider: ISecretProvider,
        configurationProvider: IConfigurationProvider,
        tasksTreeProvider: TasksTreeDataProvider,
        workItemService: IWorkItemService
    ) {
        super('Closed', secretProvider, configurationProvider, tasksTreeProvider, workItemService, 'Closed');
    }
}