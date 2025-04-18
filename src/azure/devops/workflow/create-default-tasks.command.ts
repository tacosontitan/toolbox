import * as vscode from 'vscode';
import * as devops from "azure-devops-node-api";

import { PreDefinedTask } from './pre-defined-task';
import { WorkItemType } from '../work-item-type';
import { DevOpsCommand } from '../devops-command';
import { IAssistant } from '../../../assistant';
import { WebApi } from 'azure-devops-node-api/WebApi';
import { JsonPatchDocument, Operation } from 'azure-devops-node-api/interfaces/common/VSSInterfaces';
import { WorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';

/**
 * Represents a {@link DevOpsCommand} that creates pre-defined tasks representing the typical workflow of a work item in Azure DevOps.
 */
export class CreateDefaultTasksCommand
	extends DevOpsCommand {

	private static defaultTasks: PreDefinedTask[] = [
		new PreDefinedTask('Review Pre-Defined Tasks', 0.15),
		new PreDefinedTask('Review PBI', 0.5),
		new PreDefinedTask('Reproduce Locally', 1, [WorkItemType.Bug]),
		new PreDefinedTask('Review Existing Implementation(s)', 1),
		new PreDefinedTask('Meet with Product Owners', 0.5),
		new PreDefinedTask('Meet with Stakeholders', 0.5),
		new PreDefinedTask('Meet with QA', 0.5),
		new PreDefinedTask('QA Write Test Cases', 2),
		new PreDefinedTask('QA Review Test Cases', 0.5),
		new PreDefinedTask('Dev Review Test Cases', 0.5),
		new PreDefinedTask('Create Implementation Tasks', 0.5),
		new PreDefinedTask('Setup Environment', 0.15),
		new PreDefinedTask('Create Draft PR', 0.01),
		new PreDefinedTask('Self-Review PR', 0.5),
		new PreDefinedTask('Publish PR', 0.01),
		new PreDefinedTask('Create QA Build', 0.01),
		new PreDefinedTask('QA Deployment to Test Environment', 2),
		new PreDefinedTask('QA Test Case Execution', 1),
		new PreDefinedTask('Support QA Testing', 1),
		new PreDefinedTask('Resolve PR Feedback', 1),
		new PreDefinedTask('Run PR Validations', 0.01),
		new PreDefinedTask('Complete PR', 0.01),
		new PreDefinedTask('Create Release Build', 0.01),
		new PreDefinedTask('Create Release Notes', 0.25),
		new PreDefinedTask('QA Review Release Notes', 0.5),
		new PreDefinedTask('QA Smoke Testing', 0.5),
		new PreDefinedTask('Support Smoke Testing', 0.25),
		new PreDefinedTask('Deploy to Production', 0.03),
		new PreDefinedTask('Notify Stakeholders of Deployment', 0.05),
		new PreDefinedTask('Validate in Production', 0.5)
	];

	/**
	 * Creates a new {@link CreateDefaultTasksCommand} instance.
	 */
	constructor() {
		super('createDefaultTasks');
	}

	/** @inheritdoc */
	public async execute(assistant: IAssistant, ...args: any[]): Promise<void> {
		const personalAccessToken = this.getPersonalAccessToken();
		if (!personalAccessToken) {
			vscode.window.showErrorMessage('This command requires a personal access token (PAT) to be configured.');
			return;
		}

		const organizationUri = this.getOrganizationUri();
		if (!organizationUri) {
			vscode.window.showErrorMessage('This command requires an Azure DevOps organization to be configured.');
			return;
		}

		const projectName = this.getProjectName();
		if (!projectName) {
			vscode.window.showErrorMessage("Azure DevOps project is not configured. Commands that require it will not work.");
			return;
		}

		const authenticationHandler = devops.getPersonalAccessTokenHandler(personalAccessToken);
		const connection = new WebApi(organizationUri, authenticationHandler);
		const workItemTrackingClient: WorkItemTrackingApi = await connection.getWorkItemTrackingApi();

		const workItemNumberResponse = await vscode.window.showInputBox({ prompt: 'Enter the work item number for which you want to create default tasks.' });
		const workItemNumber = parseInt(workItemNumberResponse ?? '-1');
		if (isNaN(workItemNumber) || workItemNumber <= 0) {
			vscode.window.showErrorMessage('Work item number is required to create default tasks.');
			return;
		}

		vscode.window.showInformationMessage(`Creating default tasks for work item #${workItemNumber} in project '${projectName}'...`);
		for (const task of CreateDefaultTasksCommand.defaultTasks) {
			const patchDocument: JsonPatchDocument = [
				{
					op: Operation.Add,
					path: '/fields/System.Title',
					value: task.name,
				},
				{
					op: Operation.Add,
					path: '/fields/Microsoft.VSTS.Scheduling.RemainingWork',
					value: task.remainingWork,
				},
				{
					op: Operation.Add,
					path: '/fields/System.Description',
					value: task.description,
				},
				{
					op: Operation.Add,
					path: '/relations/-',
					value: {
						rel: 'System.LinkTypes.Hierarchy-Reverse',
						url: `${organizationUri}/_apis/wit/workItems/${workItemNumber}`,
						attributes: {
							comment: 'Task created by Hazel\'s Toolbox',
						},
					},
				},
			];

			try {
				const createdTask = await workItemTrackingClient.createWorkItem(
					[],
					patchDocument,
					projectName,
					'Task'
				);
				assistant.writeLine(`Created task '${task.name}' with ID ${createdTask.id} under work item #${workItemNumber}.`);
			} catch (error) {
				const errorMessage = (error as Error).message;
				vscode.window.showErrorMessage(`Failed to create task '${task.name}': ${errorMessage}`);
			}
		}

		return Promise.resolve();
	}
}