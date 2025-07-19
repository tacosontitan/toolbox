import * as vscode from 'vscode';
import { ExtensionContext } from "vscode";
import { TasksTreeDataProvider } from "../application/providers/tasks-tree-data-provider";
import { TimeTreeDataProvider } from "../application/providers/time-tree-data-provider";
import { TimeEntryService } from "../application/time/time-entry-service";
import { ServiceLocator } from "../core";

export function registerCommands(context: ExtensionContext) {
    // Get the tree providers from service locator
    const tasksTreeProvider = ServiceLocator.getService(TasksTreeDataProvider);
    const timeTreeProvider = ServiceLocator.getService(TimeTreeDataProvider);
    const timeEntryService = ServiceLocator.getService(TimeEntryService);

    // Register time-related commands directly
    registerTimeCommands(context, timeTreeProvider, timeEntryService);

    // Register task-related commands
    registerTaskCommands(context, tasksTreeProvider);

    // Register work item commands
    registerWorkItemCommands(context, tasksTreeProvider);
}

function registerTimeCommands(context: ExtensionContext, timeTreeProvider: TimeTreeDataProvider, timeEntryService: TimeEntryService) {
    // Clock In command
    context.subscriptions.push(
        vscode.commands.registerCommand('tacosontitan.toolbox.time.clockIn', async () => {
            await timeEntryService.clockIn();
            timeTreeProvider.refresh();
        })
    );

    // Clock Out command
    context.subscriptions.push(
        vscode.commands.registerCommand('tacosontitan.toolbox.time.clockOut', async () => {
            await timeEntryService.clockOut();
            timeTreeProvider.refresh();
        })
    );

    // Refresh Time command
    context.subscriptions.push(
        vscode.commands.registerCommand('tacosontitan.toolbox.time.refresh', () => {
            timeTreeProvider.refresh();
        })
    );
}

function registerTaskCommands(context: ExtensionContext, tasksTreeProvider: TasksTreeDataProvider) {
    // TODO: Add task command registration when they're available
    // const devOpsService = ServiceLocator.getService(DevOpsService);

    // For now, just add a placeholder refresh command
    context.subscriptions.push(
        vscode.commands.registerCommand('tacosontitan.toolbox.tasks.refresh', () => {
            tasksTreeProvider.refresh();
        })
    );
}

function registerWorkItemCommands(context: ExtensionContext, tasksTreeProvider: TasksTreeDataProvider) {
    // TODO: Add work item command registration when they're available
    // const devOpsService = ServiceLocator.getService(DevOpsService);

    // For now, just add a placeholder
    context.subscriptions.push(
        vscode.commands.registerCommand('tacosontitan.toolbox.workItems.refresh', () => {
            tasksTreeProvider.refresh();
        })
    );
}