import * as vscode from 'vscode';
import { IAssistant } from "../assistant";
import { AzureRegistrar } from "../azure/azure.registrar";
import { Command } from "../command";
import { ServiceContainer } from "../dependency-injection";
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
		// Get the service provider from the configured DI container
		const serviceProvider = ServiceContainer.getServiceProvider();
		
		// Get the assistant service using type-safe resolution
		const assistant = serviceProvider.getRequiredService(IAssistant);
		
		// Create command provider
		const commandProvider = new CommandProvider();
		
		// Register commands with each registrar, passing the service provider
		for (const registrar of CommandRegistry.registrars) {
			registrar.registerCommands(serviceProvider, commandProvider);
		}

		// Register all commands with VS Code
		const commands = commandProvider.getCommands();
		for (const command of commands) {
			CommandRegistry.registerCommand(command, assistant, context);
		}
	}

	private static registerCommand(command: Command, assistant: IAssistant, context: vscode.ExtensionContext) {
		const disposable = vscode.commands.registerCommand(command.id, () => {
			command.execute(assistant).catch((error) => {
				vscode.window.showErrorMessage(`Error executing command ${command.id}: ${error.message}`);
			});
		});

		context.subscriptions.push(disposable);
	}
}