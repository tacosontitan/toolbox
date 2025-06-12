import * as vscode from 'vscode';
import { IAssistant, RuntimeAssistant } from "../assistant";
import { AzureRegistrar } from "../azure/azure.registrar";
import { Command } from "../command";
import { GitService } from "../source-control/git/git.service";
import { OutputLogger } from '../telemetry';
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
		const logger = new OutputLogger("Hazel's Toolbox");
		const sourceControlService = new GitService();
		const assistant = new RuntimeAssistant(logger, sourceControlService, context);
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