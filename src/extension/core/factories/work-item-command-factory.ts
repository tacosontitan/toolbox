import * as vscode from 'vscode';
import { Command } from '../command';

// Import Azure DevOps related commands
import { CreateDefaultTasksCommand } from '../../commands/create-default-tasks.command';
import {
    SetTaskStateToActiveCommand,
    SetTaskStateToClosedCommand,
    SetTaskStateToNewCommand,
    SetTaskStateToResolvedCommand
} from '../../commands/set-task-state.command';
import { StartWorkItemCommand } from '../../commands/start-work-item.command';
import { AddTaskCommand, RefreshTasksCommand, SetWorkItemCommand } from '../../commands/tasks-tree-commands';

// Import service dependencies
import { TasksTreeDataProvider } from '../../providers/tasks-tree-data-provider';
import { DevOpsService } from '../../services/devops-service';
import { WorkItemService } from '../../services/work-item.service';
import { NativeCommunicationService } from '../communication/communication-service.native';
import { ConfigurationManager } from '../configuration';
import { NativeConfigurationProvider } from '../configuration/configuration-provider.native';
import { NativeSecretProvider } from '../configuration/secret-provider.native';
import { GitService } from '../source-control/git.service';
import { OutputLogger } from '../telemetry/output.logger';

/**
 * Factory for creating Azure DevOps and work item related commands.
 * LEGACY: This factory is not currently used by the modern factory system.
 */
export class WorkItemCommandFactory {
	private readonly _context: vscode.ExtensionContext;
	private readonly _tasksTreeProvider: TasksTreeDataProvider;

	// Shared service instances for work item commands
	private readonly _secretProvider: NativeSecretProvider;
	private readonly _configurationProvider: NativeConfigurationProvider;
	private readonly _configurationManager: ConfigurationManager;
	private readonly _communicationService: NativeCommunicationService;
	private readonly _sourceControlService: GitService;
	private readonly _devOpsService: DevOpsService;
	private readonly _workItemService: WorkItemService;
	private readonly _logger: OutputLogger;

	constructor(context: vscode.ExtensionContext, tasksTreeProvider: TasksTreeDataProvider) {
		this._context = context;
		this._tasksTreeProvider = tasksTreeProvider;

		// Initialize shared services
		this._secretProvider = new NativeSecretProvider(context);
		this._configurationProvider = new NativeConfigurationProvider();
		this._configurationManager = new ConfigurationManager(this._configurationProvider, this._secretProvider, new OutputLogger("Hazel's Toolbox"));
		this._communicationService = new NativeCommunicationService();
		this._sourceControlService = new GitService();
		this._devOpsService = new DevOpsService(this._secretProvider, this._configurationProvider);
		this._logger = new OutputLogger("Hazel's Toolbox");
		this._workItemService = new WorkItemService(this._logger, this._communicationService, this._devOpsService);
	}

	canCreate(commandType: new (...args: any[]) => Command): boolean {
		return this.getSupportedCommandTypes().includes(commandType);
	}

	tryCreate<T extends Command>(commandType: new (...args: any[]) => T): T | undefined {
		if (!this.canCreate(commandType)) {
			return undefined;
		}

		if (commandType === CreateDefaultTasksCommand as any) {
			return new CreateDefaultTasksCommand(
				this._configurationManager,
				this._logger,
				this._workItemService
			) as unknown as T;
		}

		if (commandType === StartWorkItemCommand as any) {
			return new StartWorkItemCommand(
				this._configurationManager,
				this._logger,
				this._communicationService,
				this._sourceControlService,
				this._workItemService
			) as unknown as T;
		}

		if (commandType === AddTaskCommand as any) {
			return new AddTaskCommand(
				this._configurationManager,
				this._tasksTreeProvider,
				this._workItemService
			) as unknown as T;
		}

		if (commandType === RefreshTasksCommand as any) {
			return new RefreshTasksCommand(
				this._configurationManager,
				this._tasksTreeProvider
			) as unknown as T;
		}

		if (commandType === SetWorkItemCommand as any) {
			return new SetWorkItemCommand(
				this._configurationManager,
				this._tasksTreeProvider
			) as unknown as T;
		}

		if (commandType === SetTaskStateToNewCommand as any) {
			return new SetTaskStateToNewCommand(
				this._configurationManager,
				this._tasksTreeProvider,
				this._workItemService
			) as unknown as T;
		}

		if (commandType === SetTaskStateToActiveCommand as any) {
			return new SetTaskStateToActiveCommand(
				this._configurationManager,
				this._tasksTreeProvider,
				this._workItemService
			) as unknown as T;
		}

		if (commandType === SetTaskStateToResolvedCommand as any) {
			return new SetTaskStateToResolvedCommand(
				this._configurationManager,
				this._tasksTreeProvider,
				this._workItemService
			) as unknown as T;
		}

		if (commandType === SetTaskStateToClosedCommand as any) {
			return new SetTaskStateToClosedCommand(
				this._configurationManager,
				this._tasksTreeProvider,
				this._workItemService
			) as unknown as T;
		}

		return undefined;
	}

	private getSupportedCommandTypes(): Array<new (...args: any[]) => Command> {
		return [
			CreateDefaultTasksCommand,
			StartWorkItemCommand,
			AddTaskCommand,
			RefreshTasksCommand,
			SetWorkItemCommand,
			SetTaskStateToNewCommand,
			SetTaskStateToActiveCommand,
			SetTaskStateToResolvedCommand,
			SetTaskStateToClosedCommand
		];
	}
}
