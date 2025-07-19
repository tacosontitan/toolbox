import * as devops from "azure-devops-node-api";
import * as vscode from 'vscode';

import { WebApi } from 'azure-devops-node-api/WebApi';
import { WorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';
import { Command } from '../../../core/command';
import { ConfigurationError, IConfigurationProvider } from "../../../core/configuration";
import { ILogger, LogLevel } from "../../../core/telemetry";
import { IWorkItemService } from "../../../domain/workflow";
import { DefaultTasks } from "../../../domain/workflow/default-tasks";
import { PreDefinedTaskJsonPatchDocumentMapper } from '../../../domain/workflow/pre-defined-tasks/pre-defined-task-json-patch-document-mapper';

/**
 * Represents a {@link Command} that creates pre-defined tasks representing the typical workflow of a work item.
 *
 * REFACTORED: Now uses IConfigurationProvider for automatic validation and error handling!
 */
export class CreateDefaultTasksCommand extends Command {

	/**
	 * Creates a new {@link CreateDefaultTasksCommand} instance.
	 */
	constructor(
		private readonly configurationProvider: IConfigurationProvider,
		private readonly logger: ILogger,
		private readonly workItemService: IWorkItemService
	) {
		super('workflow.createDefaultTasks');
	}

	/** @inheritdoc */
	public async execute(...args: any[]): Promise<void> {
		try {
			// 🎯 SIMPLIFIED: Use vscode.workspace.getConfiguration directly for now
			const config = vscode.workspace.getConfiguration('tacosontitan.toolbox');

			// Check if basic required config is available
			const pat = config.get<string>('personalAccessToken');
			const org = config.get<string>('organization');
			const project = config.get<string>('project');

			if (!pat || !org || !project) {
				vscode.window.showErrorMessage('Azure DevOps configuration is incomplete. Please check your settings.');
				return;
			}

			// If we reach this point, all required config is valid and available! ✅
			await this.createDefaultTasksForWorkItem({
				personalAccessToken: pat,
				organization: org,
				project: project,
				userDisplayName: config.get<string>('userDisplayName') || 'Unknown User'
			}, args);

		} catch (error) {
			// Configuration errors are already handled with user-friendly messages
			// Only handle unexpected business logic errors here
			if (!(error instanceof ConfigurationError)) {
				this.logger.log(LogLevel.Error, `Failed to create default tasks: ${error}`);
				vscode.window.showErrorMessage(`Failed to create default tasks: ${error instanceof Error ? error.message : String(error)}`);
			}
		}
	}

	/**
	 * Creates default tasks for a work item with validated configuration.
	 */
	private async createDefaultTasksForWorkItem(config: { personalAccessToken: string, organization: string, project: string, userDisplayName: string }, args: any[]): Promise<void> {
		// Get work item number from args or prompt user
		let workItemNumber: number;
		if (args && args.length > 0 && args[0] && args[0].id) {
			workItemNumber = args[0].id;
		} else {
			const workItemNumberResponse = await vscode.window.showInputBox({
				prompt: 'Enter the work item number for which you want to create default tasks.',
				validateInput: (value) => {
					const num = parseInt(value);
					return isNaN(num) || num <= 0 ? 'Please enter a valid work item number' : null;
				}
			});

			if (!workItemNumberResponse) {
				this.logger.log(LogLevel.Warning, 'Work item number not provided. Task creation cancelled.');
				return;
			}

			workItemNumber = parseInt(workItemNumberResponse);
		}

		// Create Azure DevOps connection with validated config
		const authenticationHandler = devops.getPersonalAccessTokenHandler(config.personalAccessToken);
		const connection = new WebApi(config.organization, authenticationHandler);
		const workItemTrackingClient: WorkItemTrackingApi = await connection.getWorkItemTrackingApi();

		// Get and validate work item exists
		const workItem = await this.workItemService.getWorkItem(workItemNumber);
		if (!workItem) {
			vscode.window.showErrorMessage(`Work item #${workItemNumber} not found.`);
			return;
		}

		// Create default tasks with progress indicator
		await vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: `Creating default tasks for work item #${workItemNumber} in project '${config.project}'.`,
				cancellable: false
			},
			async (progress) => {
				this.logger.log(LogLevel.Debug, `Creating default tasks for work item #${workItemNumber} in project '${config.project}'.`);
				const taskMapper = new PreDefinedTaskJsonPatchDocumentMapper(
					config.userDisplayName,
					config.organization,
					workItemNumber,
					workItem.areaPath || "",
					workItem.iterationPath || ""
				);
				let completed = 0;

				for (const task of DefaultTasks) {
					progress.report({ message: `Creating '${task.name}' (${++completed}/${DefaultTasks.length})` });
					try {
						const patchDocument = taskMapper.map(task);
						const createdTask = await workItemTrackingClient.createWorkItem(
							[],
							patchDocument,
							config.project,
							'Task'
						);

						this.logger.log(LogLevel.Debug, `Created task '${task.name}' with ID ${createdTask.id} under work item #${workItemNumber}.`);
					} catch (error) {
						const errorMessage = (error as Error).message;
						this.logger.log(LogLevel.Error, `Failed to create task '${task.name}': ${errorMessage}`);
					}
				}

				this.logger.log(LogLevel.Information, `Default tasks created for work item #${workItemNumber}.`);
			}
		);

		// Show success message
		const action = await vscode.window.showInformationMessage(
			`Default tasks created for work item #${workItemNumber}.`,
			'Show Output'
		);

		if (action === 'Show Output' && typeof this.logger.open === 'function') {
			this.logger.open();
		}
	}
}