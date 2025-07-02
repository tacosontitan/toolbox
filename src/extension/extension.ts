import * as vscode from 'vscode';
import { IAssistant, RuntimeAssistant } from './assistant';
import { IServiceCollection, ServiceContainer } from './dependency-injection';
import { CommandRegistry } from './registration/command-registry';
import { GitService } from './source-control/git/git.service';
import { ISourceControlService } from './source-control/source-control.service';
import { ILogger, OutputLogger } from './telemetry';

/**
 * Activates the extension when it is loaded by VS Code.
 * @param context The extension context provided by VS Code.
 */
export function activate(context: vscode.ExtensionContext) {
	ServiceContainer.configure(registerServices);
	CommandRegistry.registerCommands(context);
}

/**
 * Registers services with the dependency injection container.
 * @param services The service collection to register services with.
 */
function registerServices(services: IServiceCollection) {
	services.addScoped(ILogger, OutputLogger);
	services.addScoped(IAssistant, RuntimeAssistant);
	services.addSingleton(ISourceControlService, GitService);
}