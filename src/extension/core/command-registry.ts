import * as vscode from 'vscode';
import { Command, ParametrizedCommand } from "./command";
import { ServiceContainer } from './di/service-container';
import { ICommandFactory } from './di/command-factory.interface';
import { DefaultCommandFactory } from './di/default-command-factory';
import { TasksTreeDataProvider } from '../azure/devops/tasks-tree-provider';
import { DevOpsService } from '../azure/devops/devops-service';
import { ILogger, LogLevel } from './telemetry';

/**
 * Registry for all commands in the extension.
 * Follows Single Responsibility Principle by focusing only on command registration.
 */
export class CommandRegistry {
	private readonly serviceContainer: ServiceContainer;
	private readonly commandFactory: ICommandFactory;
	private readonly logger: ILogger;

	constructor(context: vscode.ExtensionContext) {
		this.serviceContainer = ServiceContainer.getInstance(context);
		this.commandFactory = new DefaultCommandFactory(this.serviceContainer);
		this.logger = this.serviceContainer.get<ILogger>('logger');
	}

	/**
	 * Registers all commands with the provided extension context.
	 * @param context The extension context provided by Visual Studio Code.
	 */
	public static registerCommands(context: vscode.ExtensionContext) {
		const registry = new CommandRegistry(context);
		registry.registerAllCommands(context);
	}

	/**
	 * Registers all commands for the extension.
	 */
	private registerAllCommands(context: vscode.ExtensionContext): void {
		// Create and register the tasks tree view first
		const tasksTreeProvider = this.createTasksTreeView(context);

		// Register regular commands
		const commands = this.commandFactory.createCommands();
		for (const command of commands) {
			this.registerCommand(command, context);
		}

		// Register tasks tree view commands
		const treeCommands = this.commandFactory.createTreeViewCommands(tasksTreeProvider);
		for (const command of treeCommands) {
			this.registerCommand(command, context);
		}

		// Register task state commands with special handling
		this.registerTaskStateCommands(context, tasksTreeProvider);
	}

	/**
	 * Registers a single command with VS Code.
	 */
	private registerCommand(command: Command, context: vscode.ExtensionContext) {
		const disposable = vscode.commands.registerCommand(command.id, () => {
			command.execute().catch((error) => {
				this.logger.log(LogLevel.Error, `Error executing command ${command.id}: ${error.message}`);
			});
		});

		context.subscriptions.push(disposable);
	}

	/**
	 * Creates the tasks tree view and registers it with VS Code.
	 */
	private createTasksTreeView(context: vscode.ExtensionContext): TasksTreeDataProvider {
		const devOpsService = this.serviceContainer.get<DevOpsService>('devOpsService');

		// Create the tasks tree provider
		const tasksTreeProvider = new TasksTreeDataProvider(devOpsService);

		// Register the tree view
		vscode.window.createTreeView('tasksTreeView', {
			treeDataProvider: tasksTreeProvider,
			showCollapseAll: true
		});

		return tasksTreeProvider;
	}

	/**
	 * Registers task state commands that require special parameter handling.
	 */
	private registerTaskStateCommands(context: vscode.ExtensionContext, tasksTreeProvider: TasksTreeDataProvider) {
		const commands = this.commandFactory.createTaskStateCommands(tasksTreeProvider);

		for (const command of commands) {
			if (command instanceof ParametrizedCommand) {
				const disposable = vscode.commands.registerCommand(command.id, (taskItem: any) => {
					command.execute(taskItem).catch((error: Error) => {
						this.logger.log(LogLevel.Error, `Error executing command ${command.id}: ${error.message}`);
					});
				});
				context.subscriptions.push(disposable);
			} else {
				this.registerCommand(command, context);
			}
		}
	}
}