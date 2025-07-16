import * as vscode from 'vscode';
import { Command } from '../command';
import { ISpecializedCommandFactory } from './command-factory.interface';

// Import time tracking related commands
import {
    CleanupOldEntriesCommand,
    ClearTimeEntriesCommand,
    ClockInCommand,
    ClockOutCommand,
    LoadMoreDaysCommand,
    RefreshTimeCommand
} from '../../todo/time';

// Import service dependencies
import { TimeTreeDataProvider } from '../../presentation/providers/time-tree-data-provider';
import { TimeEntryService } from '../../todo/time/time-entry-service';

/**
 * Factory for creating time tracking related commands.
 */
export class TimeCommandFactory implements ISpecializedCommandFactory {
	private readonly _context: vscode.ExtensionContext;
	private readonly _timeTreeProvider: TimeTreeDataProvider;
	
	// Shared service instances for time commands
	private readonly _timeEntryService: TimeEntryService;

	constructor(context: vscode.ExtensionContext, timeTreeProvider: TimeTreeDataProvider) {
		this._context = context;
		this._timeTreeProvider = timeTreeProvider;

		// Initialize shared services
		this._timeEntryService = new TimeEntryService(context);
	}

	canCreate(commandType: new (...args: any[]) => Command): boolean {
		return this.getSupportedCommandTypes().includes(commandType);
	}

	tryCreate<T extends Command>(commandType: new (...args: any[]) => T): T | undefined {
		if (!this.canCreate(commandType)) {
			return undefined;
		}

		if (commandType === ClockInCommand as any) {
			return new ClockInCommand(
				this._timeEntryService,
				this._timeTreeProvider
			) as unknown as T;
		}

		if (commandType === ClockOutCommand as any) {
			return new ClockOutCommand(
				this._timeEntryService,
				this._timeTreeProvider
			) as unknown as T;
		}

		if (commandType === RefreshTimeCommand as any) {
			return new RefreshTimeCommand(
				this._timeTreeProvider
			) as unknown as T;
		}

		if (commandType === LoadMoreDaysCommand as any) {
			return new LoadMoreDaysCommand(
				this._timeTreeProvider
			) as unknown as T;
		}

		if (commandType === ClearTimeEntriesCommand as any) {
			return new ClearTimeEntriesCommand(
				this._timeEntryService,
				this._timeTreeProvider
			) as unknown as T;
		}

		if (commandType === CleanupOldEntriesCommand as any) {
			return new CleanupOldEntriesCommand(
				this._timeEntryService,
				this._timeTreeProvider
			) as unknown as T;
		}

		return undefined;
	}

	private getSupportedCommandTypes(): Array<new (...args: any[]) => Command> {
		return [
			ClockInCommand,
			ClockOutCommand,
			RefreshTimeCommand,
			LoadMoreDaysCommand,
			ClearTimeEntriesCommand,
			CleanupOldEntriesCommand
		];
	}
}
