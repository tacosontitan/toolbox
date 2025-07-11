import * as vscode from 'vscode';
import { DevOpsService } from '../azure/devops/devops-service';
import { AzureDevOpsWorkItemService } from '../azure/devops/workflow/azure.devops.work-item.service';
import { CreateDefaultTasksCommand } from '../azure/devops/workflow/create-default-tasks.command';
import { StartWorkItemCommand } from '../azure/devops/workflow/start-work-item.command';
import { SetWorkItemCommand, RefreshTasksCommand, AddTaskCommand, ChangeTaskStateCommand } from '../azure/devops/tasks-tree-commands';
import { TasksTreeDataProvider } from '../azure/devops/tasks-tree-provider';
import { Command } from "./command";
import { NativeCommunicationService } from './communication';
import { NativeConfigurationProvider, NativeSecretProvider } from './configuration';
import { GitService } from './source-control/git.service';
import { LogLevel, OutputLogger } from './telemetry';

/**
 * Registry for all commands in the extension.
 */
export class CommandRegistry {
	private static readonly logger = new OutputLogger("Hazel's Toolbox");

	/**
	 * Registers all commands with the provided extension context.
	 * @param context The extension context provided by Visual Studio Code.
	 */
	public static registerCommands(context: vscode.ExtensionContext) {
		const commands = this.getCommandsToRegister(context);
		for (const command of commands) {
			this.registerCommand(command, context);
		}

		// Register tasks tree view and its commands
		this.registerTasksTreeView(context);
	}

	private static registerCommand(command: Command, context: vscode.ExtensionContext) {
		const disposable = vscode.commands.registerCommand(command.id, () => {
			command.execute().catch((error) => {
				this.logger.log(LogLevel.Error, `Error executing command ${command.id}: ${error.message}`);
			});
		});

		context.subscriptions.push(disposable);
	}

	private static getCommandsToRegister(context: vscode.ExtensionContext): Command[] {
		const communicationService = new NativeCommunicationService();
		const secretProvider = new NativeSecretProvider(context);
		const configurationProvider = new NativeConfigurationProvider();
		const sourceControlService = new GitService();
		const devOpsService = new DevOpsService(secretProvider, configurationProvider);
		const workItemService = new AzureDevOpsWorkItemService(this.logger, communicationService, devOpsService);
		let commands = [
			new CreateDefaultTasksCommand(secretProvider, configurationProvider, this.logger, workItemService, devOpsService),
			new StartWorkItemCommand(secretProvider, configurationProvider, this.logger, communicationService, sourceControlService, workItemService)
		];

		return commands;
	}

	private static registerTasksTreeView(context: vscode.ExtensionContext) {
		const secretProvider = new NativeSecretProvider(context);
		const configurationProvider = new NativeConfigurationProvider();
		const devOpsService = new DevOpsService(secretProvider, configurationProvider);
		
		// Create the tasks tree provider
		const tasksTreeProvider = new TasksTreeDataProvider(devOpsService);
		
		// Register the tree view
		vscode.window.createTreeView('tasksTreeView', {
			treeDataProvider: tasksTreeProvider,
			showCollapseAll: true
		});

		// Create and register tree-specific commands
		const setWorkItemCommand = new SetWorkItemCommand(secretProvider, configurationProvider, tasksTreeProvider);
		const refreshTasksCommand = new RefreshTasksCommand(secretProvider, configurationProvider, tasksTreeProvider);
		const addTaskCommand = new AddTaskCommand(secretProvider, configurationProvider, tasksTreeProvider, devOpsService);
		const changeTaskStateCommand = new ChangeTaskStateCommand(secretProvider, configurationProvider, tasksTreeProvider, devOpsService);

		const setWorkItemDisposable = vscode.commands.registerCommand(setWorkItemCommand.id, () => {
			setWorkItemCommand.execute().catch((error) => {
				this.logger.log(LogLevel.Error, `Error executing command ${setWorkItemCommand.id}: ${error.message}`);
			});
		});

		const refreshTasksDisposable = vscode.commands.registerCommand(refreshTasksCommand.id, () => {
			refreshTasksCommand.execute().catch((error) => {
				this.logger.log(LogLevel.Error, `Error executing command ${refreshTasksCommand.id}: ${error.message}`);
			});
		});

		const addTaskDisposable = vscode.commands.registerCommand(addTaskCommand.id, () => {
			addTaskCommand.execute().catch((error) => {
				this.logger.log(LogLevel.Error, `Error executing command ${addTaskCommand.id}: ${error.message}`);
			});
		});

		const changeTaskStateDisposable = vscode.commands.registerCommand(changeTaskStateCommand.id, (taskItem) => {
			changeTaskStateCommand.execute(taskItem).catch((error) => {
				this.logger.log(LogLevel.Error, `Error executing command ${changeTaskStateCommand.id}: ${error.message}`);
			});
		});

		context.subscriptions.push(setWorkItemDisposable, refreshTasksDisposable, addTaskDisposable, changeTaskStateDisposable);
	}
}