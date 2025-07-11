import * as devops from "azure-devops-node-api";
import * as vscode from 'vscode';

import { WebApi } from 'azure-devops-node-api/WebApi';
import { WorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';
import { IConfigurationProvider, ISecretProvider } from "../../../core/configuration";
import { ILogger, LogLevel } from "../../../core/telemetry";
import { IWorkItemService } from "../../../core/workflow";
import { DevOpsCommand } from '../devops-command';
import { DevOpsService } from "../devops-service";
import { DefaultTasks } from "./default-tasks";
import { PreDefinedTaskJsonPatchDocumentMapper } from './pre-defined-tasks/pre-defined-task-json-patch-document-mapper';

/**
 * Represents a {@link DevOpsCommand} that creates pre-defined tasks representing the typical workflow of a work item in Azure DevOps.
 */
export class CreateDefaultTasksCommand
	extends DevOpsCommand {

	/**
	 * Creates a new {@link CreateDefaultTasksCommand} instance.
	 */
	constructor(
		secretProvider: ISecretProvider,
		configurationProvider: IConfigurationProvider,
		private readonly logger: ILogger,
		private readonly workItemService: IWorkItemService,
		private readonly devOpsService: DevOpsService,
	) {
		super('createDefaultTasks', secretProvider, configurationProvider);
	}

	/** @inheritdoc */
	public async execute(...args: any[]): Promise<void> {
		const personalAccessToken = await this.devOpsService.getPersonalAccessToken();
		if (!personalAccessToken) {
			vscode.window.showErrorMessage('This command requires a personal access token (PAT) to be configured.');
			this.logger.log(LogLevel.Error, 'Personal access token (PAT) is not configured. Please set it in the configuration.');
			return;
		}

		const organizationUri = await this.devOpsService.getOrganizationUri();
		if (!organizationUri) {
			vscode.window.showErrorMessage('This command requires an Azure DevOps organization to be configured.');
			this.logger.log(LogLevel.Error, 'Azure DevOps organization is not configured. Please set it in the configuration.');
			return;
		}

		const projectName = await this.devOpsService.getProjectName();
		if (!projectName) {
			vscode.window.showErrorMessage("Azure DevOps project is not configured. Commands that require it will not work.");
			this.logger.log(LogLevel.Error, "Azure DevOps project is not configured. Commands that require it will not work.");
			return;
		}

		const userDisplayName = await this.devOpsService.getUserDisplayName();
		if (!userDisplayName) {
			vscode.window.showErrorMessage('This command requires a user display name to be configured.');
			this.logger.log(LogLevel.Error, 'User display name is not configured. Please set it in the configuration.');
			return;
		}

		const authenticationHandler = devops.getPersonalAccessTokenHandler(personalAccessToken);
		const connection = new WebApi(organizationUri, authenticationHandler);
		const workItemTrackingClient: WorkItemTrackingApi = await connection.getWorkItemTrackingApi();

		const workItemNumberResponse = await vscode.window.showInputBox({ prompt: 'Enter the work item number for which you want to create default tasks.' });
		const workItemNumber = parseInt(workItemNumberResponse ?? '-1');
		if (isNaN(workItemNumber) || workItemNumber <= 0) {
			vscode.window.showErrorMessage('Work item number is required to create default tasks.');
			this.logger.log(LogLevel.Error, 'Invalid work item number provided. Please enter a valid work item number.');
			return;
		}

		const workItem = await this.workItemService.getWorkItem(workItemNumber);
		if (!workItem) {
			vscode.window.showErrorMessage(`Work item #${workItemNumber} not found.`);
			return;
		}

		await vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: `Creating default tasks for work item #${workItemNumber} in project '${projectName}'.`,
				cancellable: false
			},
			async (progress) => {
				this.logger.log(LogLevel.Debug, `Creating default tasks for work item #${workItemNumber} in project '${projectName}'.`);
				const taskMapper = new PreDefinedTaskJsonPatchDocumentMapper(userDisplayName, organizationUri, workItemNumber, workItem.areaPath || "", workItem.iterationPath || "");
				let completed = 0;

				for (const task of DefaultTasks) {
					// if (task.requiredFields && !task.requiredFields.every(field => workItemFields[field] !== undefined && workItemFields[field] !== null && workItemFields[field] !== '')) {
					// 	this.logger.log(LogLevel.Warning, `Skipping task '${task.name}' as one or more required fields are missing or empty.`);
					// 	continue;
					// }

					progress.report({ message: `Creating '${task.name}' (${++completed}/${DefaultTasks.length})` });
					try {
						const patchDocument = taskMapper.map(task);
						const createdTask = await workItemTrackingClient.createWorkItem(
							[],
							patchDocument,
							projectName,
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

		const action = await vscode.window.showInformationMessage(
			`Default tasks created for work item #${workItemNumber}.`,
			'Show Output'
		);

		if (action === 'Show Output' && typeof this.logger.open === 'function') {
			this.logger.open();
		}

		return Promise.resolve();
	}
}