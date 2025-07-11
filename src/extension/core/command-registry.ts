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
		// Create and register the tasks tree view first
		const tasksTreeProvider = this.createTasksTreeView(context);
		
		// Get regular commands
		const commands = this.getCommandsToRegister(context);
		for (const command of commands) {
			this.registerCommand(command, context);
		}

		// Get and register tasks tree view commands
		const treeCommands = this.getTasksTreeCommands(context, tasksTreeProvider);
		for (const command of treeCommands) {
			this.registerCommand(command, context);
		}

		// Special handling for the change task state command which takes a parameter
		this.registerChangeTaskStateCommand(context, tasksTreeProvider);
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

	private static createTasksTreeView(context: vscode.ExtensionContext): TasksTreeDataProvider {
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

		return tasksTreeProvider;
	}

	private static getTasksTreeCommands(context: vscode.ExtensionContext, tasksTreeProvider: TasksTreeDataProvider): Command[] {
		const secretProvider = new NativeSecretProvider(context);
		const configurationProvider = new NativeConfigurationProvider();
		const devOpsService = new DevOpsService(secretProvider, configurationProvider);
		const workItemService = new AzureDevOpsWorkItemService(this.logger, new NativeCommunicationService(), devOpsService);

		return [
			new SetWorkItemCommand(secretProvider, configurationProvider, tasksTreeProvider),
			new RefreshTasksCommand(secretProvider, configurationProvider, tasksTreeProvider),
			new AddTaskCommand(secretProvider, configurationProvider, tasksTreeProvider, workItemService)
		];
	}

	private static registerChangeTaskStateCommand(context: vscode.ExtensionContext, tasksTreeProvider: TasksTreeDataProvider) {
		const secretProvider = new NativeSecretProvider(context);
		const configurationProvider = new NativeConfigurationProvider();
		const devOpsService = new DevOpsService(secretProvider, configurationProvider);
		const workItemService = new AzureDevOpsWorkItemService(this.logger, new NativeCommunicationService(), devOpsService);
		
		const changeTaskStateCommand = new ChangeTaskStateCommand(secretProvider, configurationProvider, tasksTreeProvider, workItemService);
		
		const changeTaskStateDisposable = vscode.commands.registerCommand(changeTaskStateCommand.id, (taskItem) => {
			changeTaskStateCommand.execute(taskItem).catch((error) => {
				this.logger.log(LogLevel.Error, `Error executing command ${changeTaskStateCommand.id}: ${error.message}`);
			});
		});
		
		context.subscriptions.push(changeTaskStateDisposable);
	}
}