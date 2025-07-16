import * as vscode from 'vscode';
import { AddTaskCommand } from '../../../todo/commands/workflow/add-task.command';
import { TasksTreeDataProvider } from '../../../todo/providers/tasks-tree-data-provider';
import { WorkItemService } from '../../../todo/services/work-item.service';
import { ConfigurationManager } from '../../configuration';
import { BaseCommandFactory } from '../base-command-factory';

/**
 * Factory for creating AddTaskCommand instances.
 * REFACTORED: Now uses ConfigurationManager for simplified dependencies!
 */
export class AddTaskCommandFactory extends BaseCommandFactory<AddTaskCommand> {
	public readonly commandType = AddTaskCommand;

	constructor(
		context: vscode.ExtensionContext,
		tasksTreeProvider: TasksTreeDataProvider
	) {
		super(context, tasksTreeProvider);
	}

	public create(): AddTaskCommand {
		if (!this.tasksTreeProvider) {
			throw new Error('TasksTreeDataProvider is required for AddTaskCommand');
		}

		return new AddTaskCommand(
			this.getService(ConfigurationManager),
			this.tasksTreeProvider,
			this.getService(WorkItemService)
		);
	}
}
