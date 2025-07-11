import * as vscode from 'vscode';
import * as devops from "azure-devops-node-api";
import { WebApi } from 'azure-devops-node-api/WebApi';
import { WorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';
import { WorkItem } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import { DevOpsService } from './devops-service';
import { WorkItemTreeItem } from './work-item-tree-item';
import { TaskTreeItem } from './task-tree-item';
import { PlaceholderTreeItem } from './placeholder-tree-item';
import { StateGroupTreeItem } from './state-group-tree-item';

export class TasksTreeDataProvider implements vscode.TreeDataProvider<WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem | StateGroupTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem | StateGroupTreeItem | undefined | null | void> = new vscode.EventEmitter<WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem | StateGroupTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem | StateGroupTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private activeWorkItems: WorkItem[] = [];
    private workItemTasks: Map<number, WorkItem[]> = new Map();
    private stateGroupToWorkItem: Map<StateGroupTreeItem, number> = new Map();

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
            this.stateGroupToWorkItem.clear();
            this._onDidChangeTreeData.fire();
        });
    }

    getTreeItem(element: WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem | StateGroupTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem | StateGroupTreeItem): Promise<(WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem | StateGroupTreeItem)[]> {
        if (!element) {
            // Root level - show all active work items
            if (this.activeWorkItems.length === 0) {
                return [new PlaceholderTreeItem("No active work items", "No bugs or user stories assigned to you in non-closed state", 'info')];
            }
            return this.activeWorkItems.map(workItem => new WorkItemTreeItem(workItem, vscode.TreeItemCollapsibleState.Expanded));
        }

        if (element instanceof WorkItemTreeItem) {
            // Show tasks grouped by state under the work item
            const workItemId = element.workItem.id!;
            const tasks = this.workItemTasks.get(workItemId) || [];
            if (tasks.length === 0) {
                return [new PlaceholderTreeItem("No tasks found", "This work item has no child tasks", 'info')];
            }
            
            // Group tasks by state
            const stateGroups = await this.groupTasksByState(tasks, workItemId);
            return stateGroups;
        }

        if (element instanceof StateGroupTreeItem) {
            // Show tasks under the state group
            const workItemId = this.stateGroupToWorkItem.get(element);
            if (!workItemId) {
                return [];
            }
            
            const tasks = this.workItemTasks.get(workItemId) || [];
            const filteredTasks = await this.filterTasksByStateGroup(tasks, element.stateName);
            return filteredTasks.map(task => new TaskTreeItem(task));
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
                query: `SELECT [System.Id] FROM WorkItems WHERE [System.AssignedTo] CONTAINS '${userDisplayName}' AND ([System.WorkItemType] = 'Bug' OR [System.WorkItemType] = 'User Story') AND [System.State] <> 'Closed' AND [System.State] <> 'Removed' AND [System.State] <> 'Spiked' ORDER BY [System.Id]`
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
                this.stateGroupToWorkItem.clear();
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
            this.stateGroupToWorkItem.clear();
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

    private async groupTasksByState(tasks: WorkItem[], workItemId: number): Promise<StateGroupTreeItem[]> {
        const readyState = await this.devOpsService.getReadyTaskState();
        const inProgressState = await this.devOpsService.getInProgressTaskState();
        const doneState = await this.devOpsService.getDoneTaskState();
        const showRemovedTasks = await this.devOpsService.getShowRemovedTasks();

        // Filter out removed tasks if configured to not show them
        const filteredTasks = showRemovedTasks 
            ? tasks 
            : tasks.filter(task => task.fields?.['System.State'] !== 'Removed');

        // Group tasks by their mapped state categories
        const groups: { [key: string]: WorkItem[] } = {};
        
        for (const task of filteredTasks) {
            const taskState = task.fields?.['System.State'];
            const mappedState = this.mapTaskStateToGroup(taskState, readyState, inProgressState, doneState);
            
            if (!groups[mappedState]) {
                groups[mappedState] = [];
            }
            groups[mappedState].push(task);
        }

        // Create state group tree items in the requested order
        const stateOrder = ['In Progress', 'Ready', 'Closed', 'Removed'];
        const stateGroups: StateGroupTreeItem[] = [];

        for (const stateName of stateOrder) {
            const tasksInState = groups[stateName];
            if (tasksInState && tasksInState.length > 0) {
                // Skip "Removed" if configured to not show
                if (stateName === 'Removed' && !showRemovedTasks) {
                    continue;
                }
                const stateGroup = new StateGroupTreeItem(stateName, tasksInState.length);
                this.stateGroupToWorkItem.set(stateGroup, workItemId);
                stateGroups.push(stateGroup);
            }
        }

        return stateGroups;
    }

    private mapTaskStateToGroup(taskState: string, readyState: string, inProgressState: string, doneState: string): string {
        if (!taskState) {
            return 'Ready'; // Default for undefined states
        }

        // Map configured states to groups
        if (taskState === inProgressState || taskState === 'Active' || taskState === 'Doing' || taskState === 'In Progress') {
            return 'In Progress';
        }
        
        if (taskState === readyState || taskState === 'New' || taskState === 'To Do' || taskState === 'Ready') {
            return 'Ready';
        }
        
        if (taskState === doneState || taskState === 'Done' || taskState === 'Completed' || taskState === 'Closed' || taskState === 'Resolved') {
            return 'Closed';
        }
        
        if (taskState === 'Removed') {
            return 'Removed';
        }

        // Default mapping for unknown states
        return 'Ready';
    }

    private async filterTasksByStateGroup(tasks: WorkItem[], stateName: string): Promise<WorkItem[]> {
        const readyState = await this.devOpsService.getReadyTaskState();
        const inProgressState = await this.devOpsService.getInProgressTaskState();
        const doneState = await this.devOpsService.getDoneTaskState();
        const showRemovedTasks = await this.devOpsService.getShowRemovedTasks();

        return tasks.filter(task => {
            const taskState = task.fields?.['System.State'];
            
            // Filter out removed tasks if configured to not show them
            if (!showRemovedTasks && taskState === 'Removed') {
                return false;
            }
            
            const mappedState = this.mapTaskStateToGroup(taskState, readyState, inProgressState, doneState);
            return mappedState === stateName;
        });
    }

    getActiveWorkItems(): WorkItem[] {
        return this.activeWorkItems;
    }
}