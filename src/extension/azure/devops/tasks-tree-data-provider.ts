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

    private activeWorkItems: WorkItem[] = [];
    private workItemTasks: Map<number, WorkItem[]> = new Map();

    constructor(private devOpsService: DevOpsService) {
        // Load active work items on initialization
        this.refresh();
    }

    refresh(): void {
        // Load all active work items when refreshing
        this.loadActiveWorkItems().then(() => {
            this._onDidChangeTreeData.fire();
        }).catch(() => {
            // Clear data if reload fails
            this.activeWorkItems = [];
            this.workItemTasks.clear();
            this._onDidChangeTreeData.fire();
        });
    }

    getTreeItem(element: WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem): Promise<(WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem)[]> {
        if (!element) {
            // Root level - show all active work items
            if (this.activeWorkItems.length === 0) {
                return [new PlaceholderTreeItem("No active work items", "No bugs or user stories assigned to you in non-closed state", 'info')];
            }
            return this.activeWorkItems.map(workItem => new WorkItemTreeItem(workItem, vscode.TreeItemCollapsibleState.Expanded));
        }

        if (element instanceof WorkItemTreeItem) {
            // Show tasks under the work item
            const workItemId = element.workItem.id!;
            const tasks = this.workItemTasks.get(workItemId) || [];
            if (tasks.length === 0) {
                return [new PlaceholderTreeItem("No tasks found", "This work item has no child tasks", 'info')];
            }
            return tasks.map(task => new TaskTreeItem(task));
        }

        return [];
    }

    private async loadActiveWorkItems(): Promise<void> {
        try {
            const personalAccessToken = await this.devOpsService.getPersonalAccessToken();
            const organizationUri = await this.devOpsService.getOrganizationUri();
            const projectName = await this.devOpsService.getProjectName();
            const userDisplayName = await this.devOpsService.getUserDisplayName();

            if (!personalAccessToken || !organizationUri || !projectName || !userDisplayName) {
                vscode.window.showErrorMessage('Azure DevOps configuration is incomplete. Please check your settings.');
                return;
            }

            const authenticationHandler = devops.getPersonalAccessTokenHandler(personalAccessToken);
            const connection = new WebApi(organizationUri, authenticationHandler);
            const workItemTrackingClient: WorkItemTrackingApi = await connection.getWorkItemTrackingApi();

            // Get all active work items (bugs and user stories) assigned to the user
            const wiql = {
                query: `SELECT [System.Id] FROM WorkItems WHERE [System.AssignedTo] CONTAINS '${userDisplayName}' AND ([System.WorkItemType] = 'Bug' OR [System.WorkItemType] = 'User Story') AND [System.State] <> 'Closed' AND [System.State] <> 'Removed' ORDER BY [System.Id]`
            };

            const queryResult = await workItemTrackingClient.queryByWiql(wiql);
            
            if (queryResult.workItems && queryResult.workItems.length > 0) {
                const workItemIds = queryResult.workItems.map(wi => wi.id!);
                this.activeWorkItems = await workItemTrackingClient.getWorkItems(workItemIds, undefined, undefined, undefined, undefined, projectName);
                
                // Load tasks for each work item
                this.workItemTasks.clear();
                for (const workItem of this.activeWorkItems) {
                    await this.loadTasksForWorkItem(workItem.id!, workItemTrackingClient, projectName);
                }
            } else {
                this.activeWorkItems = [];
                this.workItemTasks.clear();
            }

        } catch (error) {
            const errorMessage = (error as Error).message;
            if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
                vscode.window.showErrorMessage('Authentication failed. Please check your personal access token.');
            } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
                vscode.window.showErrorMessage('Network error. Please check your connection and try again.');
            } else {
                vscode.window.showErrorMessage(`Failed to load active work items: ${errorMessage}`);
            }
            this.activeWorkItems = [];
            this.workItemTasks.clear();
        }
    }

    private async loadTasksForWorkItem(workItemId: number, workItemTrackingClient: WorkItemTrackingApi, projectName: string): Promise<void> {
        try {
            // Get child tasks using a WIQL query
            const wiql = {
                query: `SELECT [System.Id] FROM WorkItems WHERE [System.Parent] = ${workItemId} AND [System.WorkItemType] = 'Task' ORDER BY [System.Id]`
            };

            const queryResult = await workItemTrackingClient.queryByWiql(wiql);
            
            if (queryResult.workItems && queryResult.workItems.length > 0) {
                const taskIds = queryResult.workItems.map(wi => wi.id!);
                const tasks = await workItemTrackingClient.getWorkItems(taskIds, undefined, undefined, undefined, undefined, projectName);
                this.workItemTasks.set(workItemId, tasks);
            } else {
                this.workItemTasks.set(workItemId, []);
            }
        } catch (error) {
            // If we can't load tasks for a work item, just set empty array
            this.workItemTasks.set(workItemId, []);
        }
    }
}