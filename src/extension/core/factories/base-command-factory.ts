import * as vscode from 'vscode';
import { TasksTreeDataProvider } from '../../todo/providers/tasks-tree-data-provider';
import { TimeTreeDataProvider } from '../../todo/time/time-tree-data-provider';
import { Command } from '../command';
import { ServiceLocator } from '../services/service-locator';
import { ICommandFactory } from './command-factory.interface';

/**
 * Abstract base class for command factories that provides common functionality.
 */
export abstract class BaseCommandFactory<T extends Command> implements ICommandFactory<T> {
	protected readonly context: vscode.ExtensionContext;
	protected readonly tasksTreeProvider?: TasksTreeDataProvider;
	protected readonly timeTreeProvider?: TimeTreeDataProvider;
	public abstract readonly commandType: new (...args: any[]) => T;

	constructor(
		context: vscode.ExtensionContext,
		tasksTreeProvider?: TasksTreeDataProvider,
		timeTreeProvider?: TimeTreeDataProvider
	) {
		this.context = context;
		this.tasksTreeProvider = tasksTreeProvider;
		this.timeTreeProvider = timeTreeProvider;
	}

	/**
	 * Gets a service instance using the service locator.
	 */
	protected getService<TService>(serviceType: new (...args: any[]) => TService): TService {
		return ServiceLocator.getService(serviceType);
	}

	/**
	 * Creates an instance of the command with all dependencies injected.
	 * Subclasses must implement this method to provide the specific command creation logic.
	 */
	public abstract create(): T;

	/**
	 * Determines if this factory can create the specified command type.
	 */
	public canCreate(commandType: new (...args: any[]) => Command): boolean {
		return commandType === this.commandType;
	}
}
