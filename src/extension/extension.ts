import * as vscode from 'vscode';
import { ModernCommandRegistry } from './core/modern-command-registry';

/**
 * Activates the extension when it is loaded by VS Code.
 * @param context The extension context provided by VS Code.
 */
export function activate(context: vscode.ExtensionContext) {
	// Register all commands and views using the modern factory-based approach
	ModernCommandRegistry.registerAll(context);
}

/**
 * Deactivates the extension when it is unloaded by VS Code.
 */
export function deactivate() {
	// No cleanup needed with the new factory approach
}