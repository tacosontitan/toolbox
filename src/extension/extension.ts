import * as vscode from 'vscode';
import { CommandRegistry } from './core/command-registry';

/**
 * Activates the extension when it is loaded by VS Code.
 * @param context The extension context provided by VS Code.
 */
export function activate(context: vscode.ExtensionContext) {
	// Register regular commands
	CommandRegistry.registerCommands(context);
}