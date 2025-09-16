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
    createOverviewWebview(context);
    createTasksTreeView(context);
    createMeetingView(context);
    createTimeTreeView(context);
}

function createOverviewWebview(context: ExtensionContext): OverviewWebviewProvider {
    const devOpsService = ServiceLocator.getService(DevOpsService);
    const overviewWebviewProvider = new OverviewWebviewProvider(context.extensionUri, devOpsService);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(OverviewWebviewProvider.viewType, overviewWebviewProvider)
    );

    return overviewWebviewProvider;
}

function createTasksTreeView(context: ExtensionContext): TasksTreeDataProvider {
    const devOpsService = ServiceLocator.getService(DevOpsService);
    const tasksTreeProvider = new TasksTreeDataProvider(devOpsService);
    ServiceLocator.registerFactory(TasksTreeDataProvider, () => tasksTreeProvider);

    vscode.window.createTreeView('tasksTreeView', {
        treeDataProvider: tasksTreeProvider,
        showCollapseAll: true
    });

    return tasksTreeProvider;
}

function createMeetingView(context: ExtensionContext): void {
    const devOpsService = ServiceLocator.getService(DevOpsService);
    const meetingViewProvider = new MeetingViewProvider(context.extensionUri, devOpsService);

    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            MeetingViewProvider.viewType,
            meetingViewProvider
        )
    );
}

function createTimeTreeView(context: ExtensionContext): TimeTreeDataProvider {
    const timeEntryService = ServiceLocator.getService(TimeEntryService);
    const timeTreeProvider = new TimeTreeDataProvider(timeEntryService);
    ServiceLocator.registerFactory(TimeTreeDataProvider, () => timeTreeProvider);

    vscode.window.createTreeView('timeTreeView', {
        treeDataProvider: timeTreeProvider,
        showCollapseAll: true
    });

    return timeTreeProvider;
}
