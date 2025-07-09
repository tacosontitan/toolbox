import * as vscode from 'vscode';
import { CommandRegistry } from './registration/command-registry';
import { TasksTreeDataProvider } from './azure/devops/tasks-tree-provider';
import { SetWorkItemCommand, RefreshTasksCommand } from './azure/devops/tasks-tree-commands';
import { RuntimeAssistant } from './assistant';

/**
 * Activates the extension when it is loaded by VS Code.
 * @param context The extension context provided by VS Code.
 */
export function activate(context: vscode.ExtensionContext) {
	// Register regular commands
	CommandRegistry.registerCommands(context);

	// Create the assistant and tasks tree provider
	const assistant = new RuntimeAssistant(context);
	const tasksTreeProvider = new TasksTreeDataProvider(assistant);
	
	// Register the tree view
	vscode.window.createTreeView('tasksTreeView', {
		treeDataProvider: tasksTreeProvider,
		showCollapseAll: true
	});

	// Register tree-specific commands
	const setWorkItemCommand = new SetWorkItemCommand(tasksTreeProvider);
	const refreshTasksCommand = new RefreshTasksCommand(tasksTreeProvider);

	const setWorkItemDisposable = vscode.commands.registerCommand(setWorkItemCommand.id, () => {
		setWorkItemCommand.execute(assistant).catch((error) => {
			vscode.window.showErrorMessage(`Error executing command ${setWorkItemCommand.id}: ${error.message}`);
		});
	});

	const refreshTasksDisposable = vscode.commands.registerCommand(refreshTasksCommand.id, () => {
		refreshTasksCommand.execute(assistant).catch((error) => {
			vscode.window.showErrorMessage(`Error executing command ${refreshTasksCommand.id}: ${error.message}`);
		});
	});

	context.subscriptions.push(setWorkItemDisposable, refreshTasksDisposable);
}