import * as vscode from 'vscode';
import { ClockInCommand } from '../../../time';
import { TimeEntryService } from '../../../time/time-entry-service';
import { TimeTreeDataProvider } from '../../../time/time-tree-data-provider';
import { BaseCommandFactory } from '../base-command-factory';

/**
 * Factory for creating ClockInCommand instances.
 */
export class ClockInCommandFactory extends BaseCommandFactory<ClockInCommand> {
	public readonly commandType = ClockInCommand;

	constructor(
		context: vscode.ExtensionContext,
		timeTreeProvider: TimeTreeDataProvider
	) {
		super(context, undefined, timeTreeProvider);
	}

	public create(): ClockInCommand {
		if (!this.timeTreeProvider) {
			throw new Error('TimeTreeDataProvider is required for ClockInCommand');
		}

		return new ClockInCommand(
			this.getService(TimeEntryService),
			this.timeTreeProvider
		);
	}
}
