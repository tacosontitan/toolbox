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
    const tasksTreeProvider = ServiceLocator.getService(TasksTreeDataProvider);
    const timeTreeProvider = ServiceLocator.getService(TimeTreeDataProvider);
    const timeEntryService = ServiceLocator.getService(TimeEntryService);

    registerTimeCommands(context, timeTreeProvider, timeEntryService);
    registerTaskCommands(context, tasksTreeProvider);
    registerWorkItemCommands(context, tasksTreeProvider);
    registerWorkflowCommands(context);
}

function registerTimeCommands(context: ExtensionContext, timeTreeProvider: TimeTreeDataProvider, timeEntryService: TimeEntryService) {
    context.subscriptions.push(
        vscode.commands.registerCommand('tacosontitan.toolbox.time.clockIn', async () => {
            await timeEntryService.clockIn();
            timeTreeProvider.refresh();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('tacosontitan.toolbox.time.clockOut', async () => {
            await timeEntryService.clockOut();
            timeTreeProvider.refresh();
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('tacosontitan.toolbox.time.refresh', () => {
            timeTreeProvider.refresh();
        })
    );
}

function registerTaskCommands(context: ExtensionContext, tasksTreeProvider: TasksTreeDataProvider) {
    context.subscriptions.push(
        vscode.commands.registerCommand('tacosontitan.toolbox.tasks.refresh', () => {
            tasksTreeProvider.refresh();
        })
    );
}

function registerWorkItemCommands(context: ExtensionContext, tasksTreeProvider: TasksTreeDataProvider) {
    context.subscriptions.push(
        vscode.commands.registerCommand('tacosontitan.toolbox.workflow.refreshTasks', () => {
            tasksTreeProvider.refresh();
        })
    );
}

function registerWorkflowCommands(context: ExtensionContext) {
    const configurationProvider = ServiceLocator.getService(IConfigurationProvider);
    const logger = ServiceLocator.getService(ILogger);
    const communicationService = ServiceLocator.getService(ICommunicationService);
    const workItemService = ServiceLocator.getService(WorkItemService);
    const templateLoader = ServiceLocator.getService(JsonTemplateLoader);
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