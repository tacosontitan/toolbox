import * as vscode from 'vscode';
import * as toolbox from './setup';

/**
 * Activates the extension when it is loaded by VS Code.
 * @param context The extension context provided by VS Code.
 */
export async function activate(context: vscode.ExtensionContext) {
	toolbox.initialize(context);
	toolbox.registerServices(context);
	toolbox.registerViews(context);
	toolbox.registerCommands(context);
	
	// Initialize templates after services are registered
	await toolbox.initializeTemplates();
}