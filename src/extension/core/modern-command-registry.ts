import * as vscode from 'vscode';
import { OverviewWebviewProvider } from '../application/providers/overview-webview-provider';
import { TimeTreeDataProvider } from '../application/providers/time-tree-data-provider';
import { DevOpsService } from '../infrastructure/azure/devops-service';
import { NativeConfigurationProvider } from '../infrastructure/vscode/configuration-provider.native';
import { NativeSecretProvider } from '../infrastructure/vscode/secret-provider.native';
import { MeetingViewProvider } from '../meetings/meeting-view-provider';
import { TasksTreeDataProvider } from '../todo/providers/tasks-tree-data-provider';
import { TimeEntryService } from '../todo/time/time-entry-service';
import { CommandFactoryBootstrap } from './factories/command-factory-registry';

/**
 * Modern command registry that uses the 1:1 command-to-factory pattern.
 * This provides perfect scalability and follows the C# pattern exactly.
 */
export class ModernCommandRegistry {
	/**
	 * Registers all commands and views with the provided extension context.
	 * @param context The extension context provided by Visual Studio Code.
	 */
	public static registerAll(context: vscode.ExtensionContext): void {
		// Create and register webviews and tree views first
		this.createOverviewWebview(context);
		const tasksTreeProvider = this.createTasksTreeView(context);
		this.createMeetingView(context);
		const timeTreeProvider = this.createTimeTreeView(context);

		// Initialize the 1:1 command factory system
		CommandFactoryBootstrap.initialize(context, tasksTreeProvider, timeTreeProvider);
		
		// Register all commands using individual factories
		CommandFactoryBootstrap.registerCommands(context);

		// Register cleanup on deactivation
		context.subscriptions.push(new vscode.Disposable(() => {
			CommandFactoryBootstrap.dispose();
		}));
	}

	private static createOverviewWebview(context: vscode.ExtensionContext): OverviewWebviewProvider {
		// Create dependencies
		const secretProvider = new NativeSecretProvider(context);
		const configurationProvider = new NativeConfigurationProvider();
		const devOpsService = new DevOpsService(secretProvider, configurationProvider);

		// Create the overview webview provider
		const overviewWebviewProvider = new OverviewWebviewProvider(context.extensionUri, devOpsService);

		// Register the webview view
		context.subscriptions.push(
			vscode.window.registerWebviewViewProvider(OverviewWebviewProvider.viewType, overviewWebviewProvider)
		);

		return overviewWebviewProvider;
	}

	private static createTasksTreeView(context: vscode.ExtensionContext): TasksTreeDataProvider {
		const secretProvider = new NativeSecretProvider(context);
		const configurationProvider = new NativeConfigurationProvider();
		const devOpsService = new DevOpsService(secretProvider, configurationProvider);

		// Create the tasks tree provider
		const tasksTreeProvider = new TasksTreeDataProvider(devOpsService);

		// Register the tree view
		vscode.window.createTreeView('tasksTreeView', {
			treeDataProvider: tasksTreeProvider,
			showCollapseAll: true
		});

		return tasksTreeProvider;
	}

	private static createMeetingView(context: vscode.ExtensionContext): void {
		const secretProvider = new NativeSecretProvider(context);
		const configurationProvider = new NativeConfigurationProvider();
		const devOpsService = new DevOpsService(secretProvider, configurationProvider);

		// Create the meeting view provider
		const meetingViewProvider = new MeetingViewProvider(context.extensionUri, devOpsService);

		// Register the webview view provider
		context.subscriptions.push(
			vscode.window.registerWebviewViewProvider(
				MeetingViewProvider.viewType,
				meetingViewProvider
			)
		);
	}

	private static createTimeTreeView(context: vscode.ExtensionContext): TimeTreeDataProvider {
		const timeEntryService = new TimeEntryService(context);

		// Create the time tree provider
		const timeTreeProvider = new TimeTreeDataProvider(timeEntryService);

		// Register the tree view
		vscode.window.createTreeView('timeTreeView', {
			treeDataProvider: timeTreeProvider,
			showCollapseAll: true
		});

		return timeTreeProvider;
	}
}
