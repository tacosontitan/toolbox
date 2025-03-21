import * as vscode from 'vscode';

import { PreDefinedTask } from './pre-defined-task';
import { WorkItemType } from '../work-item-type';
import { DevOpsCommand } from '../devops-command';
import { IAssistant } from '../../../assistant';

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
	public execute(assistant: IAssistant, ...args: any[]): Promise<void> {
		const personalAccessToken = this.getPersonalAccessToken();
		// if (!personalAccessToken) {
		// 	return Promise.resolve();
		// }
		
		vscode.window.showWarningMessage('This feature is not yet implemented. Default tasks will not be created.');
		vscode.window.showInformationMessage('Your configured PAT is ' + personalAccessToken);
		for (const task of CreateDefaultTasksCommand.defaultTasks) {
			assistant.writeLine(`Creating task '${task.name}' with '${task.remainingWork}' hours of remaining work.`);
		}
		
		return Promise.resolve();
	}
}