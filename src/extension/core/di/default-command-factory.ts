import * as vscode from 'vscode';
import { Command } from '../command';
import { ICommandFactory } from './command-factory.interface';
import { ServiceContainer } from './service-container';
import { IConfigurationProvider, ISecretProvider } from '../configuration';
import { ILogger } from '../telemetry';
import { ICommunicationService } from '../communication';
import { GitService } from '../source-control/git.service';
import { IWorkItemService } from '../workflow';
import { DevOpsService } from '../../azure/devops/devops-service';
import { TasksTreeDataProvider } from '../../azure/devops/tasks-tree-data-provider';

// Command imports
import { CreateDefaultTasksCommand } from '../../azure/devops/workflow/create-default-tasks.command';
import { StartWorkItemCommand } from '../../azure/devops/workflow/start-work-item.command';
import { SetWorkItemCommand, RefreshTasksCommand, AddTaskCommand } from '../../azure/devops/tasks-tree-commands';
import {
    SetTaskStateToActiveCommand,
    SetTaskStateToClosedCommand,
    SetTaskStateToNewCommand,
    SetTaskStateToResolvedCommand
} from '../../azure/devops/set-task-state-command';

/**
 * Default command factory that creates commands using the service container.
 */
export class DefaultCommandFactory implements ICommandFactory {
    constructor(private readonly serviceContainer: ServiceContainer) {}

    createCommands(): Command[] {
        const logger = this.serviceContainer.get<ILogger>('logger');
        const communicationService = this.serviceContainer.get<ICommunicationService>('communicationService');
        const secretProvider = this.serviceContainer.get<ISecretProvider>('secretProvider');
        const configurationProvider = this.serviceContainer.get<IConfigurationProvider>('configurationProvider');
        const gitService = this.serviceContainer.get<GitService>('gitService');
        const workItemService = this.serviceContainer.get<IWorkItemService>('workItemService');
        const devOpsService = this.serviceContainer.get<DevOpsService>('devOpsService');

        return [
            new CreateDefaultTasksCommand(secretProvider, configurationProvider, logger, workItemService, devOpsService),
            new StartWorkItemCommand(secretProvider, configurationProvider, logger, communicationService, gitService, workItemService)
        ];
    }

    createTreeViewCommands(tasksTreeProvider: TasksTreeDataProvider): Command[] {
        const secretProvider = this.serviceContainer.get<ISecretProvider>('secretProvider');
        const configurationProvider = this.serviceContainer.get<IConfigurationProvider>('configurationProvider');
        const devOpsService = this.serviceContainer.get<DevOpsService>('devOpsService');
        const workItemService = this.serviceContainer.get<IWorkItemService>('workItemService');

        return [
            new SetWorkItemCommand(secretProvider, configurationProvider, tasksTreeProvider, devOpsService),
            new RefreshTasksCommand(secretProvider, configurationProvider, tasksTreeProvider),
            new AddTaskCommand(secretProvider, configurationProvider, tasksTreeProvider, workItemService)
        ];
    }

    createTaskStateCommands(tasksTreeProvider: TasksTreeDataProvider): Command[] {
        const secretProvider = this.serviceContainer.get<ISecretProvider>('secretProvider');
        const configurationProvider = this.serviceContainer.get<IConfigurationProvider>('configurationProvider');
        const workItemService = this.serviceContainer.get<IWorkItemService>('workItemService');

        return [
            new SetTaskStateToNewCommand(secretProvider, configurationProvider, tasksTreeProvider, workItemService),
            new SetTaskStateToActiveCommand(secretProvider, configurationProvider, tasksTreeProvider, workItemService),
            new SetTaskStateToResolvedCommand(secretProvider, configurationProvider, tasksTreeProvider, workItemService),
            new SetTaskStateToClosedCommand(secretProvider, configurationProvider, tasksTreeProvider, workItemService)
        ];
    }
}