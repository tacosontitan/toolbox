import * as vscode from 'vscode';
import { AzureRegistrar } from "../azure/azure.registrar";
import { Command } from "../command";
import { IServiceProvider, ServiceContainer } from "../dependency-injection";
import { CommandProvider } from "./command-provider";
import { IRegistrar } from "./registrar";

/**
 * Registry for all commands in the extension.
 */
export class CommandRegistry {
	private static registrars: IRegistrar[] = [
		new AzureRegistrar()
	];

	private constructor() { }

	/**
	 * Registers all commands with the provided extension context.
	 * @param context The extension context provided by Visual Studio Code.
	 */
	public static registerCommands(context: vscode.ExtensionContext) {
		const serviceProvider = ServiceContainer.getServiceProvider();

		const commandProvider = new CommandProvider();
		for (const registrar of CommandRegistry.registrars) {
			registrar.registerCommands(serviceProvider, commandProvider);
		}

		const commands = commandProvider.getCommands();
		for (const command of commands) {
			CommandRegistry.registerCommand(command, serviceProvider, context);
		}
	}

	private static registerCommand(command: Command, serviceProvider: IServiceProvider, context: vscode.ExtensionContext) {
		const disposable = vscode.commands.registerCommand(command.id, () => {
			command.execute().catch((error) => {
				vscode.window.showErrorMessage(`Error executing command ${command.id}: ${error.message}`);
			});
		});

		context.subscriptions.push(disposable);
	}
}