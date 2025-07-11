import * as vscode from 'vscode';
import { IConfigurationProvider, ISecretProvider } from "../../core/configuration";
import { DevOpsCommand } from './devops-command';
import { DevOpsService } from './devops-service';
import { TasksTreeDataProvider, TaskTreeItem } from './tasks-tree-provider';
import * as devops from "azure-devops-node-api";
import { WebApi } from 'azure-devops-node-api/WebApi';
import { WorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';
import { JsonPatchDocument, JsonPatchOperation, Operation } from "azure-devops-node-api/interfaces/common/VSSInterfaces";

/**
 * Command to set the work item number for the tasks tree view.
 */
export class SetWorkItemCommand extends DevOpsCommand {
    constructor(
        secretProvider: ISecretProvider,
        configurationProvider: IConfigurationProvider,
        private tasksTreeProvider: TasksTreeDataProvider
    ) {
        super('setWorkItem', secretProvider, configurationProvider);
    }

    async execute(...args: any[]): Promise<void> {
        const workItemNumberResponse = await vscode.window.showInputBox({ 
            prompt: 'Enter the work item number to view its tasks',
            placeHolder: 'e.g., 12345'
        });

        const workItemNumber = parseInt(workItemNumberResponse ?? '-1');
        if (isNaN(workItemNumber) || workItemNumber <= 0) {
            vscode.window.showErrorMessage('Please enter a valid work item number.');
            return;
        }

        await this.tasksTreeProvider.setWorkItem(workItemNumber);
        vscode.window.showInformationMessage(`Tasks tree view updated for work item #${workItemNumber}`);
    }
}

/**
 * Command to refresh the tasks tree view.
 */
export class RefreshTasksCommand extends DevOpsCommand {
    constructor(
        secretProvider: ISecretProvider,
        configurationProvider: IConfigurationProvider,
        private tasksTreeProvider: TasksTreeDataProvider
    ) {
        super('refreshTasks', secretProvider, configurationProvider);
    }

    async execute(...args: any[]): Promise<void> {
        this.tasksTreeProvider.refresh();
        vscode.window.showInformationMessage('Tasks tree view refreshed');
    }
}

/**
 * Command to add a new task to the current work item.
 */
export class AddTaskCommand extends DevOpsCommand {
    constructor(
        secretProvider: ISecretProvider,
        configurationProvider: IConfigurationProvider,
        private tasksTreeProvider: TasksTreeDataProvider,
        private devOpsService: DevOpsService
    ) {
        super('addTask', secretProvider, configurationProvider);
    }

    async execute(...args: any[]): Promise<void> {
        const currentWorkItemId = this.tasksTreeProvider.getCurrentWorkItemId();
        if (!currentWorkItemId) {
            vscode.window.showErrorMessage('No work item selected. Please set a work item first.');
            return;
        }

        const title = await vscode.window.showInputBox({
            prompt: 'Enter the title for the new task',
            placeHolder: 'e.g., Implement user authentication'
        });

        if (!title || title.trim() === '') {
            return;
        }

        const description = await vscode.window.showInputBox({
            prompt: 'Enter a description for the task (optional)',
            placeHolder: 'Detailed description of the task...'
        });

        try {
            await this.createTask(currentWorkItemId, title.trim(), description?.trim() || '');
            vscode.window.showInformationMessage(`Task "${title}" created successfully`);
            this.tasksTreeProvider.refresh();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create task: ${(error as Error).message}`);
        }
    }

    private async createTask(parentWorkItemId: number, title: string, description: string): Promise<void> {
        const personalAccessToken = await this.devOpsService.getPersonalAccessToken();
        const organizationUri = await this.devOpsService.getOrganizationUri();
        const projectName = await this.devOpsService.getProjectName();

        if (!personalAccessToken || !organizationUri || !projectName) {
            throw new Error('Azure DevOps configuration is incomplete');
        }

        const authenticationHandler = devops.getPersonalAccessTokenHandler(personalAccessToken);
        const connection = new WebApi(organizationUri, authenticationHandler);
        const workItemTrackingClient: WorkItemTrackingApi = await connection.getWorkItemTrackingApi();

        const document: JsonPatchDocument = [
            {
                op: Operation.Add,
                path: '/fields/System.Title',
                value: title
            },
            {
                op: Operation.Add,
                path: '/fields/System.WorkItemType',
                value: 'Task'
            },
            {
                op: Operation.Add,
                path: '/fields/System.State',
                value: 'New'
            },
            {
                op: Operation.Add,
                path: '/fields/System.Description',
                value: description
            },
            {
                op: Operation.Add,
                path: '/relations/-',
                value: {
                    rel: 'System.LinkTypes.Hierarchy-Reverse',
                    url: `${organizationUri}${projectName}/_apis/wit/workItems/${parentWorkItemId}`
                }
            }
        ];

        await workItemTrackingClient.createWorkItem(undefined, document, projectName, 'Task');
    }
}

/**
 * Command to change the state of a task.
 */
export class ChangeTaskStateCommand extends DevOpsCommand {
    constructor(
        secretProvider: ISecretProvider,
        configurationProvider: IConfigurationProvider,
        private tasksTreeProvider: TasksTreeDataProvider,
        private devOpsService: DevOpsService
    ) {
        super('changeTaskState', secretProvider, configurationProvider);
    }

    async execute(taskItem?: TaskTreeItem): Promise<void> {
        if (!taskItem) {
            vscode.window.showErrorMessage('No task selected');
            return;
        }

        const availableStates = ['New', 'Active', 'Resolved', 'Closed'];
        const currentState = taskItem.task.fields?.['System.State'];
        
        const newState = await vscode.window.showQuickPick(
            availableStates.filter(state => state !== currentState),
            {
                placeHolder: `Current state: ${currentState}. Select new state:`
            }
        );

        if (!newState) {
            return;
        }

        try {
            await this.updateTaskState(taskItem.task.id!, newState);
            vscode.window.showInformationMessage(`Task state changed to ${newState}`);
            this.tasksTreeProvider.refresh();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to update task state: ${(error as Error).message}`);
        }
    }

    private async updateTaskState(taskId: number, newState: string): Promise<void> {
        const personalAccessToken = await this.devOpsService.getPersonalAccessToken();
        const organizationUri = await this.devOpsService.getOrganizationUri();
        const projectName = await this.devOpsService.getProjectName();

        if (!personalAccessToken || !organizationUri || !projectName) {
            throw new Error('Azure DevOps configuration is incomplete');
        }

        const authenticationHandler = devops.getPersonalAccessTokenHandler(personalAccessToken);
        const connection = new WebApi(organizationUri, authenticationHandler);
        const workItemTrackingClient: WorkItemTrackingApi = await connection.getWorkItemTrackingApi();

        const document: JsonPatchDocument = [
            {
                op: Operation.Replace,
                path: '/fields/System.State',
                value: newState
            }
        ];

        await workItemTrackingClient.updateWorkItem(undefined, document, taskId, projectName);
    }
}