import * as vscode from 'vscode';
import { TasksTreeDataProvider } from '../../../application/providers/tasks-tree-data-provider';
import { Command } from '../../../core/command';
import { IConfigurationProvider } from "../../../core/configuration";
import { IWorkItemService } from '../../../domain/workflow';
import { TaskTreeItem } from '../../../presentation/workflow/task-tree-item';

/**
 * Base command to set task state to a specific value.
 * REFACTORED: Now uses IConfigurationProvider for simplified dependencies!
 */
export abstract class SetTaskStateCommand extends Command {
    constructor(
        commandSuffix: string,
        protected readonly configurationProvider: IConfigurationProvider,
        protected tasksTreeProvider: TasksTreeDataProvider,
        protected workItemService: IWorkItemService,
        protected targetState: string
    ) {
        super(`setTaskStateTo${commandSuffix}`);
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
        configurationProvider: IConfigurationProvider,
        tasksTreeProvider: TasksTreeDataProvider,
        workItemService: IWorkItemService
    ) {
        super('New', configurationProvider, tasksTreeProvider, workItemService, 'New');
    }
}

/**
 * Command to set task state to Active.
 */
export class SetTaskStateToActiveCommand extends SetTaskStateCommand {
    constructor(
        configurationProvider: IConfigurationProvider,
        tasksTreeProvider: TasksTreeDataProvider,
        workItemService: IWorkItemService
    ) {
        super('Active', configurationProvider, tasksTreeProvider, workItemService, 'Active');
    }
}

/**
 * Command to set task state to Resolved.
 */
export class SetTaskStateToResolvedCommand extends SetTaskStateCommand {
    constructor(
        configurationProvider: IConfigurationProvider,
        tasksTreeProvider: TasksTreeDataProvider,
        workItemService: IWorkItemService
    ) {
        super('Resolved', configurationProvider, tasksTreeProvider, workItemService, 'Resolved');
    }
}

/**
 * Command to set task state to Closed.
 */
export class SetTaskStateToClosedCommand extends SetTaskStateCommand {
    constructor(
        configurationProvider: IConfigurationProvider,
        tasksTreeProvider: TasksTreeDataProvider,
        workItemService: IWorkItemService
    ) {
        super('Closed', configurationProvider, tasksTreeProvider, workItemService, 'Closed');
    }
}