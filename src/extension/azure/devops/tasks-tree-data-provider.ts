import * as vscode from 'vscode';
import * as devops from "azure-devops-node-api";
import { WebApi } from 'azure-devops-node-api/WebApi';
import { WorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';
import { WorkItem } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import { DevOpsService } from './devops-service';
import { WorkItemTreeItem } from './work-item-tree-item';
import { TaskTreeItem } from './task-tree-item';
import { PlaceholderTreeItem } from './placeholder-tree-item';

export class TasksTreeDataProvider implements vscode.TreeDataProvider<WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem | undefined | null | void> = new vscode.EventEmitter<WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private workItemNumber: number | undefined;
    private workItem: WorkItem | undefined;
    private tasks: WorkItem[] = [];

    constructor(private devOpsService: DevOpsService) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    async setWorkItem(workItemNumber: number): Promise<void> {
        this.workItemNumber = workItemNumber;
        
        // Show loading state
        this.workItem = {
            id: workItemNumber,
            fields: {
                'System.Title': 'Loading...',
                'System.WorkItemType': '',
                'System.State': ''
            }
        } as WorkItem;
        this.tasks = [];
        this.refresh();
        
        await this.loadWorkItemAndTasks();
        this.refresh();
    }

    getTreeItem(element: WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem): Promise<(WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem)[]> {
        if (!element) {
            // Root level - show the work item if one is set
            if (this.workItem) {
                return [new WorkItemTreeItem(this.workItem, vscode.TreeItemCollapsibleState.Expanded)];
            } else {
                // Show a placeholder item when no work item is set
                return [new PlaceholderTreeItem("No work item selected", "Use the search icon to set a work item", 'info')];
            }
        }

        if (element instanceof WorkItemTreeItem) {
            // Show tasks under the work item
            if (this.tasks.length === 0) {
                return [new PlaceholderTreeItem("No tasks found", "This work item has no child tasks", 'info')];
            }
            return this.tasks.map(task => new TaskTreeItem(task));
        }

        return [];
    }

    getCurrentWorkItemId(): number | undefined {
        return this.workItemNumber;
    }

    private async loadWorkItemAndTasks(): Promise<void> {
        if (!this.workItemNumber) {
            return;
        }

        try {
            const personalAccessToken = await this.devOpsService.getPersonalAccessToken();
            const organizationUri = await this.devOpsService.getOrganizationUri();
            const projectName = await this.devOpsService.getProjectName();

            if (!personalAccessToken || !organizationUri || !projectName) {
                vscode.window.showErrorMessage('Azure DevOps configuration is incomplete. Please check your settings.');
                return;
            }

            const authenticationHandler = devops.getPersonalAccessTokenHandler(personalAccessToken);
            const connection = new WebApi(organizationUri, authenticationHandler);
            const workItemTrackingClient: WorkItemTrackingApi = await connection.getWorkItemTrackingApi();

            // Get the main work item
            this.workItem = await workItemTrackingClient.getWorkItem(this.workItemNumber);

            // Get child tasks using a WIQL query
            const wiql = {
                query: `SELECT [System.Id] FROM WorkItems WHERE [System.Parent] = ${this.workItemNumber} AND [System.WorkItemType] = 'Task' ORDER BY [System.Id]`
            };

            const queryResult = await workItemTrackingClient.queryByWiql(wiql);
            
            if (queryResult.workItems && queryResult.workItems.length > 0) {
                const taskIds = queryResult.workItems.map(wi => wi.id!);
                this.tasks = await workItemTrackingClient.getWorkItems(taskIds, undefined, undefined, undefined, undefined, projectName);
            } else {
                this.tasks = [];
            }

        } catch (error) {
            const errorMessage = (error as Error).message;
            if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
                vscode.window.showErrorMessage('Authentication failed. Please check your personal access token.');
            } else if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
                vscode.window.showErrorMessage(`Work item #${this.workItemNumber} not found. Please check the work item number.`);
            } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
                vscode.window.showErrorMessage('Network error. Please check your connection and try again.');
            } else {
                vscode.window.showErrorMessage(`Failed to load work item and tasks: ${errorMessage}`);
            }
            this.workItem = undefined;
            this.tasks = [];
        }
    }
}