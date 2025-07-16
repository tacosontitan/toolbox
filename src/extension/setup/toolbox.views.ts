import * as vscode from 'vscode';
import { ExtensionContext } from "vscode";
import { MeetingViewProvider } from "../application/providers/meeting-view-provider";
import { OverviewWebviewProvider } from "../application/providers/overview-webview-provider";
import { TasksTreeDataProvider } from "../application/providers/tasks-tree-data-provider";
import { TimeTreeDataProvider } from "../application/providers/time-tree-data-provider";
import { TimeEntryService } from "../application/time/time-entry-service";
import { ServiceLocator } from "../core";
import { DevOpsService } from "../infrastructure/azure/devops-service";

export function registerViews(context: ExtensionContext) {
    // Create and register all view providers
    createOverviewWebview(context);
    createTasksTreeView(context);
    createMeetingView(context);
    createTimeTreeView(context);
}

function createOverviewWebview(context: ExtensionContext): OverviewWebviewProvider {
    // Get dependencies from service locator
    const devOpsService = ServiceLocator.getService(DevOpsService);

    // Create the overview webview provider
    const overviewWebviewProvider = new OverviewWebviewProvider(context.extensionUri, devOpsService);

    // Register the webview view
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(OverviewWebviewProvider.viewType, overviewWebviewProvider)
    );

    return overviewWebviewProvider;
}

function createTasksTreeView(context: ExtensionContext): TasksTreeDataProvider {
    // Get dependencies from service locator
    const devOpsService = ServiceLocator.getService(DevOpsService);

    // Create the tasks tree provider
    const tasksTreeProvider = new TasksTreeDataProvider(devOpsService);

    // Register with service locator for command access
    ServiceLocator.registerFactory(TasksTreeDataProvider, () => tasksTreeProvider);

    // Register the tree view
    vscode.window.createTreeView('tasksTreeView', {
        treeDataProvider: tasksTreeProvider,
        showCollapseAll: true
    });

    return tasksTreeProvider;
}

function createMeetingView(context: ExtensionContext): void {
    // Get dependencies from service locator
    const devOpsService = ServiceLocator.getService(DevOpsService);

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

function createTimeTreeView(context: ExtensionContext): TimeTreeDataProvider {
    // Get dependencies from service locator
    const timeEntryService = ServiceLocator.getService(TimeEntryService);

    // Create the time tree provider
    const timeTreeProvider = new TimeTreeDataProvider(timeEntryService);

    // Register with service locator for command access
    ServiceLocator.registerFactory(TimeTreeDataProvider, () => timeTreeProvider);

    // Register the tree view
    vscode.window.createTreeView('timeTreeView', {
        treeDataProvider: timeTreeProvider,
        showCollapseAll: true
    });

    return timeTreeProvider;
}
