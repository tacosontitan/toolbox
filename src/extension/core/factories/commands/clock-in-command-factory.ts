import * as vscode from 'vscode';
import { TimeTreeDataProvider } from '../../../presentation/providers/time-tree-data-provider';
import { ClockInCommand } from '../../../todo/time';
import { TimeEntryService } from '../../../todo/time/time-entry-service';
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
