import * as vscode from 'vscode';
import { CreateDefaultTasksCommand } from '../azure/devops/workflow/create-default-tasks.command';
import { Command } from "./command";
import { NativeSecretProvider } from './configuration';
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
		const secretProvider = new NativeSecretProvider(context);
		const configurationProvider = new NativeSecretProvider(context);
		let commands = [
			new CreateDefaultTasksCommand(this.logger, secretProvider, configurationProvider)
		];

		return commands;
	}
}