import * as devops from "azure-devops-node-api";
import * as vscode from 'vscode';

import { WebApi } from 'azure-devops-node-api/WebApi';
import { WorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';
import { IAssistant } from '../../../assistant';
import { DevOpsCommand } from '../devops-command';
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
	constructor() {
		super('createDefaultTasks');
	}

	/** @inheritdoc */
	public async execute(assistant: IAssistant, ...args: any[]): Promise<void> {
		const personalAccessToken = await this.getPersonalAccessToken(assistant);
		if (!personalAccessToken) {
			vscode.window.showErrorMessage('This command requires a personal access token (PAT) to be configured.');
			assistant.writeLine('Personal access token (PAT) is not configured. Please set it in the configuration.');
			return;
		}

		const organizationUri = this.getOrganizationUri();
		if (!organizationUri) {
			vscode.window.showErrorMessage('This command requires an Azure DevOps organization to be configured.');
			assistant.writeLine('Azure DevOps organization is not configured. Please set it in the configuration.');
			return;
		}

		const projectName = this.getProjectName();
		if (!projectName) {
			vscode.window.showErrorMessage("Azure DevOps project is not configured. Commands that require it will not work.");
			assistant.writeLine("Azure DevOps project is not configured. Commands that require it will not work.");
			return;
		}

		const userDisplayName = this.getUserDisplayName();
		if (!userDisplayName) {
			vscode.window.showErrorMessage('This command requires a user display name to be configured.');
			assistant.writeLine('User display name is not configured. Please set it in the configuration.');
			return;
		}

		const authenticationHandler = devops.getPersonalAccessTokenHandler(personalAccessToken);
		const connection = new WebApi(organizationUri, authenticationHandler);
		const workItemTrackingClient: WorkItemTrackingApi = await connection.getWorkItemTrackingApi();

		const workItemNumberResponse = await vscode.window.showInputBox({ prompt: 'Enter the work item number for which you want to create default tasks.' });
		const workItemNumber = parseInt(workItemNumberResponse ?? '-1');
		if (isNaN(workItemNumber) || workItemNumber <= 0) {
			vscode.window.showErrorMessage('Work item number is required to create default tasks.');
			assistant.writeLine('Invalid work item number provided. Please enter a valid work item number.');
			return;
		}

		// Retrieve the parent work item details
		let areaPath: string | undefined;
		let iterationPath: string | undefined;
		try {
			const parentWorkItem = await workItemTrackingClient.getWorkItem(workItemNumber);
			const workItemTitle = parentWorkItem.fields?.['System.Title'] as string;
			const confirmation = await vscode.window.showInformationMessage(
				`Are you sure you want to create default tasks for work item #${workItemNumber} (${workItemTitle})?`,
				'Yes',
				'No'
			);

			if (confirmation !== 'Yes') {
				assistant.writeLine(`User cancelled the operation to create default tasks for work item #${workItemNumber}.`);
				return;
			}

			areaPath = parentWorkItem.fields?.['System.AreaPath'] as string;
			iterationPath = parentWorkItem.fields?.['System.IterationPath'] as string;
		} catch (error) {
			vscode.window.showErrorMessage(`Failed to retrieve parent work item #${workItemNumber}: ${(error as Error).message}`);
			assistant.writeLine(`Failed to retrieve parent work item #${workItemNumber}: ${(error as Error).message}`);
			return;
		}



		await vscode.window.withProgress(
			{
				location: vscode.ProgressLocation.Notification,
				title: `Creating default tasks for work item #${workItemNumber} in project '${projectName}'.`,
				cancellable: false
			},
			async (progress) => {
				assistant.writeLine(`Creating default tasks for work item #${workItemNumber} in project '${projectName}'.`);
				const taskMapper = new PreDefinedTaskJsonPatchDocumentMapper(userDisplayName, organizationUri, workItemNumber, areaPath, iterationPath);
				let completed = 0;
				for (const task of DefaultTasks) {
					progress.report({ message: `Creating '${task.name}' (${++completed}/${DefaultTasks.length})` });
					try {
						const patchDocument = taskMapper.map(task);
						const createdTask = await workItemTrackingClient.createWorkItem(
							[],
							patchDocument,
							projectName,
							'Task'
						);

						assistant.writeLine(`Created task '${task.name}' with ID ${createdTask.id} under work item #${workItemNumber}.`);
					} catch (error) {
						const errorMessage = (error as Error).message;
						assistant.writeLine(`Failed to create task '${task.name}': ${errorMessage}`);
					}
				}
			}
		);

		const action = await vscode.window.showInformationMessage(
			`Default tasks created for work item #${workItemNumber}.`,
			'Show Output'
		);

		if (action === 'Show Output' && typeof assistant.showOutputChannel === 'function') {
			assistant.showOutputChannel();
		}

		return Promise.resolve();
	}
}