import * as vscode from 'vscode';
import { StartWorkItemCommand } from '../../../commands/workflow/start-work-item.command';
import { WorkItemService } from '../../../services/work-item.service';
import { NativeCommunicationService } from '../../communication/communication-service.native';
import { ConfigurationManager } from '../../configuration/configuration-manager';
import { GitService } from '../../source-control/git.service';
import { OutputLogger } from '../../telemetry/output.logger';
import { BaseCommandFactory } from '../base-command-factory';

/**
 * Factory for creating StartWorkItemCommand instances.
 * REFACTORED: Now uses ConfigurationManager instead of individual providers!
 */
export class StartWorkItemCommandFactory extends BaseCommandFactory<StartWorkItemCommand> {
	public readonly commandType = StartWorkItemCommand;

	constructor(context: vscode.ExtensionContext) {
		super(context);
	}

	public create(): StartWorkItemCommand {
		// BEFORE: 6 service dependencies with separate config providers
		// AFTER: 5 services with centralized configuration management! 🎉
		return new StartWorkItemCommand(
			this.getService(ConfigurationManager),  // Replaces secretProvider + configProvider!
			this.getService(OutputLogger),
			this.getService(NativeCommunicationService),
			this.getService(GitService),
			this.getService(WorkItemService)
		);
	}
}
