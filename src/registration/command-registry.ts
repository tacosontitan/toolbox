import { Command } from "../command";
import * as vscode from 'vscode';
import { IRegistrar } from "./registrar";
import { AzureRegistrar } from "../azure/azure.registrar";
import { CommandProvider } from "./command-provider";
import { IAssistant, RuntimeAssistant } from "../assistant";

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
		const assistant = new RuntimeAssistant();
		const commandProvider = new CommandProvider();
		for (const registrar of CommandRegistry.registrars) {
			registrar.registerCommands(commandProvider);
		}
		
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