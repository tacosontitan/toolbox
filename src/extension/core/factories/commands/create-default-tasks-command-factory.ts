import * as vscode from 'vscode';
import { CreateDefaultTasksCommand } from '../../../commands/create-default-tasks.command';
import { WorkItemService } from '../../../services/work-item.service';
import { ConfigurationManager } from '../../configuration/configuration-manager';
import { OutputLogger } from '../../telemetry/output.logger';
import { BaseCommandFactory } from '../base-command-factory';

/**
 * Factory for creating CreateDefaultTasksCommand instances.
 * REFACTORED: Now uses ConfigurationManager instead of individual providers!
 */
export class CreateDefaultTasksCommandFactory extends BaseCommandFactory<CreateDefaultTasksCommand> {
	public readonly commandType = CreateDefaultTasksCommand;

	constructor(context: vscode.ExtensionContext) {
		super(context);
	}

	public create(): CreateDefaultTasksCommand {
		// BEFORE: 5 separate service injections with duplicated validation logic
		// AFTER: 3 clean services with centralized configuration management! 🎉
		return new CreateDefaultTasksCommand(
			this.getService(ConfigurationManager),  // Replaces secretProvider + configProvider + devOpsService!
			this.getService(OutputLogger),
			this.getService(WorkItemService)
		);
	}
}
