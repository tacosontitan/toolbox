import * as vscode from 'vscode';
import { ExtensionContext } from "vscode";
import { TasksTreeDataProvider } from "../application/providers/tasks-tree-data-provider";
import { TimeTreeDataProvider } from "../application/providers/time-tree-data-provider";
import { TimeEntryService } from "../application/time/time-entry-service";
import { ICommunicationService, IConfigurationProvider, ILogger, ServiceLocator } from "../core";
import { JsonTemplateLoader } from "../domain/workflow/pre-defined-tasks/json-template-loader";
import { WorkItemService } from "../infrastructure/azure/work-item.service";
import { CreateDefaultTasksCommand } from "../presentation/commands/workflow/create-default-tasks.command";
import { StartWorkItemCommand } from "../presentation/commands/workflow/start-work-item.command";

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

    // Register workflow commands
    registerWorkflowCommands(context);
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

function registerWorkflowCommands(context: ExtensionContext) {
    // Get dependencies from service locator
    const configurationProvider = ServiceLocator.getService(IConfigurationProvider);
    const logger = ServiceLocator.getService(ILogger);
    const communicationService = ServiceLocator.getService(ICommunicationService);
    const workItemService = ServiceLocator.getService(WorkItemService);
    const templateLoader = ServiceLocator.getService(JsonTemplateLoader);

    // Create and register the CreateDefaultTasksCommand
    const createDefaultTasksCommand = new CreateDefaultTasksCommand(
        configurationProvider,
        logger,
        workItemService,
        templateLoader
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(createDefaultTasksCommand.id, (...args) =>
            createDefaultTasksCommand.execute(...args)
        )
    );

    // Create and register the StartWorkItemCommand
    const startWorkItemCommand = new StartWorkItemCommand(
        logger,
        communicationService,
        ServiceLocator.getService('IWorkflowService')
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(startWorkItemCommand.id, () =>
            startWorkItemCommand.execute()
        )
    );
}