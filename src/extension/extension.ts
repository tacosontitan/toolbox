import * as vscode from 'vscode';
import { CreateDefaultTasksCommand } from './azure/devops/workflow/create-default-tasks.command';
import { Command } from './core/command';
import { CommandRegistry } from './core/command-registry';
import { LogLevel, OutputLogger } from './core/telemetry';

/**
 * Activates the extension when it is loaded by VS Code.
 * @param context The extension context provided by VS Code.
 */
export function activate(context: vscode.ExtensionContext) {
	CommandRegistry.registerCommands(context);
}

function registerCommand(command: Command, context: vscode.ExtensionContext) {
	const loggerChannelName = "Hazel's Toolbox";
	const logger = new OutputLogger(loggerChannelName);
	const disposable = vscode.commands.registerCommand(command.id, () => {
		command.execute().catch((error) => {
			logger.log(LogLevel.Error, `Error executing command ${command.id}: ${error.message}`);
		});
	});

	context.subscriptions.push(disposable);
}

function registerCommands(context: vscode.ExtensionContext) {
	const loggerChannelName = "Hazel's Toolbox";
	const logger = new OutputLogger(loggerChannelName);
	const createDefaultTasksCommand = new CreateDefaultTasksCommand(logger);
	const disposable = vscode.commands.registerCommand(createDefaultTasksCommand.id, () => {
		createDefaultTasksCommand.execute().catch((error) => {
			logger.log(LogLevel.Error, `Error executing command ${createDefaultTasksCommand.id}: ${error.message}`);
		});
	});

	context.subscriptions.push(disposable);
}