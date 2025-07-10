import * as vscode from 'vscode';
import { DevOpsService } from '../azure/devops/devops-service';
import { AzureDevOpsWorkItemService } from '../azure/devops/workflow/azure.devops.work-item.service';
import { CreateDefaultTasksCommand } from '../azure/devops/workflow/create-default-tasks.command';
import { StartWorkItemCommand } from '../azure/devops/workflow/start-work-item.command';
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
		const workItemService = new AzureDevOpsWorkItemService(secretProvider, configurationProvider, this.logger, communicationService, devOpsService);
		let commands = [
			new CreateDefaultTasksCommand(secretProvider, configurationProvider, this.logger, workItemService, devOpsService),
			new StartWorkItemCommand(secretProvider, configurationProvider, this.logger, communicationService, sourceControlService, workItemService)
		];

		return commands;
	}
}