import * as vscode from 'vscode';
import { TimeTreeDataProvider } from '../../application/providers/time-tree-data-provider';
import { NativeCommunicationService } from '../../infrastructure/vscode/communication-service.native';
import { NativeConfigurationProvider } from '../../infrastructure/vscode/configuration-provider.native';
import { NativeSecretProvider } from '../../infrastructure/vscode/secret-provider.native';
import { TasksTreeDataProvider } from '../../todo/providers/tasks-tree-data-provider';
import { DevOpsService } from '../../todo/services/devops-service';
import { WorkItemService } from '../../todo/services/work-item.service';
import { TimeEntryService } from '../../todo/time/time-entry-service';
import { GitService } from '../source-control/git.service';
import { OutputLogger } from '../telemetry/output.logger';

/**
 * Shared services container that manages common service instances across command factories.
 * This ensures we don't duplicate service creation while maintaining clean separation.
 */
export class SharedServices {
	private static _instance: SharedServices | null = null;

	// Core services
	private readonly _secretProvider: NativeSecretProvider;
	private readonly _configurationProvider: NativeConfigurationProvider;
	private readonly _communicationService: NativeCommunicationService;
	private readonly _sourceControlService: GitService;
	private readonly _logger: OutputLogger;

	// Derived services
	private readonly _devOpsService: DevOpsService;
	private readonly _workItemService: WorkItemService;
	private readonly _timeEntryService: TimeEntryService;

	// Tree providers (injected from outside)
	private _tasksTreeProvider: TasksTreeDataProvider | null = null;
	private _timeTreeProvider: TimeTreeDataProvider | null = null;

	private constructor(context: vscode.ExtensionContext) {
		// Initialize core services
		this._secretProvider = new NativeSecretProvider(context);
		this._configurationProvider = new NativeConfigurationProvider();
		this._communicationService = new NativeCommunicationService();
		this._sourceControlService = new GitService();
		this._logger = new OutputLogger("Hazel's Toolbox");

		// Initialize derived services
		this._devOpsService = new DevOpsService(this._secretProvider, this._configurationProvider);
		this._workItemService = new WorkItemService(this._logger, this._communicationService, this._devOpsService);
		this._timeEntryService = new TimeEntryService(context);
	}

	/**
	 * Initializes the shared services singleton.
	 */
	public static initialize(
		context: vscode.ExtensionContext,
		tasksTreeProvider: TasksTreeDataProvider,
		timeTreeProvider: TimeTreeDataProvider
	): void {
		SharedServices._instance = new SharedServices(context);
		SharedServices._instance._tasksTreeProvider = tasksTreeProvider;
		SharedServices._instance._timeTreeProvider = timeTreeProvider;
	}

	/**
	 * Gets the shared services instance.
	 */
	public static get instance(): SharedServices {
		if (!SharedServices._instance) {
			throw new Error('SharedServices must be initialized before use');
		}
		return SharedServices._instance;
	}

	// Service getters
	public get secretProvider(): NativeSecretProvider { return this._secretProvider; }
	public get configurationProvider(): NativeConfigurationProvider { return this._configurationProvider; }
	public get communicationService(): NativeCommunicationService { return this._communicationService; }
	public get sourceControlService(): GitService { return this._sourceControlService; }
	public get logger(): OutputLogger { return this._logger; }
	public get devOpsService(): DevOpsService { return this._devOpsService; }
	public get workItemService(): WorkItemService { return this._workItemService; }
	public get timeEntryService(): TimeEntryService { return this._timeEntryService; }

	public get tasksTreeProvider(): TasksTreeDataProvider {
		if (!this._tasksTreeProvider) {
			throw new Error('TasksTreeProvider not initialized');
		}
		return this._tasksTreeProvider;
	}

	public get timeTreeProvider(): TimeTreeDataProvider {
		if (!this._timeTreeProvider) {
			throw new Error('TimeTreeProvider not initialized');
		}
		return this._timeTreeProvider;
	}

	/**
	 * Cleans up the shared services.
	 */
	public static dispose(): void {
		SharedServices._instance = null;
	}
}
