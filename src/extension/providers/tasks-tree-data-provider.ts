import * as devops from "azure-devops-node-api";
import { WebApi } from 'azure-devops-node-api/WebApi';
import { WorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';
import { WorkItem } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import * as vscode from 'vscode';
import { PlaceholderTreeItem } from '../core/placeholder-tree-item';
import { StateGroupTreeItem } from '../core/state-group-tree-item';
import { TaskTreeItem } from '../core/task-tree-item';
import { WorkItemTreeItem } from '../core/work-item-tree-item';
import { DevOpsService } from '../services/devops-service';

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
                return [new PlaceholderTreeItem("No active work items", "No active work items assigned to you", 'info')];
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

            // Get excluded work item states from configuration
            const excludedStates = await this.devOpsService.getExcludedWorkItemStates();
            const stateFilters = excludedStates.map(state => `[System.State] <> '${state}'`).join(' AND ');

            // Get active work item types from configuration
            const activeWorkItemTypes = await this.devOpsService.getActiveWorkItemTypes();
            const workItemTypeFilters = activeWorkItemTypes.map(type => `[System.WorkItemType] = '${type}'`).join(' OR ');

            // Get all active work items assigned to the user
            const wiql = {
                query: `SELECT [System.Id] FROM WorkItems WHERE [System.AssignedTo] CONTAINS '${userDisplayName}' AND (${workItemTypeFilters}) AND ${stateFilters} ORDER BY [System.Id]`
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
            // Get child tasks using a WIQL query, ordered by backlog priority to maintain backlog order
            const wiql = {
                query: `SELECT [System.Id] FROM WorkItems WHERE [System.Parent] = ${workItemId} AND [System.WorkItemType] = 'Task' ORDER BY [Microsoft.VSTS.Common.BacklogPriority] ASC, [System.Id] ASC`
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
        const showRemovedTasks = await this.devOpsService.getShowInactiveTasks();

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
        const showRemovedTasks = await this.devOpsService.getShowInactiveTasks();

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

    // Drag and Drop implementation
    async handleDrag(source: (WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem | StateGroupTreeItem)[], treeDataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): Promise<void> {
        // Only allow dragging tasks
        const tasks = source.filter(item => item instanceof TaskTreeItem) as TaskTreeItem[];
        if (tasks.length === 0) {
            return;
        }

        treeDataTransfer.set('application/vnd.code.tree.taskstreeview', new vscode.DataTransferItem(tasks));
    }

    async handleDrop(target: WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem | StateGroupTreeItem | undefined, treeDataTransfer: vscode.DataTransfer, token: vscode.CancellationToken): Promise<void> {
        const transferItem = treeDataTransfer.get('application/vnd.code.tree.taskstreeview');
        if (!transferItem) {
            return;
        }

        const tasks = transferItem.value as TaskTreeItem[];
        if (!tasks || tasks.length === 0) {
            return;
        }

        // Find the target state group
        let targetStateGroup: StateGroupTreeItem | undefined;
        let targetWorkItemId: number | undefined;
        let insertIndex: number | undefined;

        if (target instanceof StateGroupTreeItem) {
            targetStateGroup = target;
            targetWorkItemId = this.stateGroupToWorkItem.get(target);
            // Insert at the end of the state group
            insertIndex = undefined;
        } else if (target instanceof TaskTreeItem) {
            // Find the parent state group and work item for the target task
            for (const [stateGroup, workItemId] of this.stateGroupToWorkItem.entries()) {
                const workItemTasks = this.workItemTasks.get(workItemId) || [];
                const targetTaskIndex = workItemTasks.findIndex(task => task.id === target.task.id);
                if (targetTaskIndex !== -1) {
                    targetStateGroup = stateGroup;
                    targetWorkItemId = workItemId;
                    insertIndex = targetTaskIndex;
                    break;
                }
            }
        }

        if (!targetStateGroup || !targetWorkItemId) {
            vscode.window.showErrorMessage('Invalid drop target. Tasks can only be dropped on state groups or other tasks.');
            return;
        }

        try {
            // Update task order in Azure DevOps
            await this.reorderTasksInBacklog(tasks, targetWorkItemId, targetStateGroup.stateName, insertIndex);

            // Refresh the tree view to reflect changes
            this.refresh();

            vscode.window.showInformationMessage(`Reordered ${tasks.length} task(s) in the backlog.`);
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to reorder tasks: ${(error as Error).message}`);
        }
    }

    private async reorderTasksInBacklog(tasksToReorder: TaskTreeItem[], targetWorkItemId: number, targetStateName: string, insertIndex?: number): Promise<void> {
        const personalAccessToken = await this.devOpsService.getPersonalAccessToken();
        const organizationUri = await this.devOpsService.getOrganizationUri();
        const projectName = await this.devOpsService.getProjectName();

        if (!personalAccessToken || !organizationUri || !projectName) {
            throw new Error('Azure DevOps configuration is incomplete. Please check your settings.');
        }

        const authenticationHandler = devops.getPersonalAccessTokenHandler(personalAccessToken);
        const connection = new WebApi(organizationUri, authenticationHandler);
        const workItemTrackingClient: WorkItemTrackingApi = await connection.getWorkItemTrackingApi();

        // Get current tasks for the target work item
        const currentTasks = this.workItemTasks.get(targetWorkItemId) || [];

        // Filter tasks by the target state to work within the same state group
        const readyState = await this.devOpsService.getReadyTaskState();
        const inProgressState = await this.devOpsService.getInProgressTaskState();
        const doneState = await this.devOpsService.getDoneTaskState();

        const tasksInTargetState = currentTasks.filter(task => {
            const taskState = task.fields?.['System.State'];
            const mappedState = this.mapTaskStateToGroup(taskState, readyState, inProgressState, doneState);
            return mappedState === targetStateName;
        });

        // Calculate new backlog priorities
        const updates: { taskId: number, newPriority: number }[] = [];

        // Remove the tasks being reordered from their current positions
        const remainingTasks = tasksInTargetState.filter(task =>
            !tasksToReorder.some(reorderTask => reorderTask.task.id === task.id)
        );

        // Determine insert position
        const targetIndex = insertIndex !== undefined ? insertIndex : remainingTasks.length;

        // Create new order with reordered tasks inserted at target position
        const newOrder = [
            ...remainingTasks.slice(0, targetIndex),
            ...tasksToReorder.map(item => item.task),
            ...remainingTasks.slice(targetIndex)
        ];

        // Calculate priorities - use the pattern from existing priorities or create new ones
        const basePriority = this.calculateBasePriority(tasksInTargetState);

        for (let i = 0; i < newOrder.length; i++) {
            const task = newOrder[i];
            const newPriority = basePriority + (i * 10); // Space priorities by 10 to allow future insertions
            updates.push({ taskId: task.id!, newPriority });
        }

        // Update each task's backlog priority
        for (const update of updates) {
            const patchDocument = [
                {
                    op: 'replace',
                    path: '/fields/Microsoft.VSTS.Common.BacklogPriority',
                    value: update.newPriority
                }
            ];

            await workItemTrackingClient.updateWorkItem(undefined, patchDocument, update.taskId, projectName);
        }
    }

    private calculateBasePriority(existingTasks: WorkItem[]): number {
        if (existingTasks.length === 0) {
            return 1000; // Start with 1000 if no tasks exist
        }

        // Find the minimum priority and subtract to create space
        const priorities = existingTasks
            .map(task => task.fields?.['Microsoft.VSTS.Common.BacklogPriority'] as number)
            .filter(priority => priority !== undefined && priority !== null);

        if (priorities.length === 0) {
            return 1000; // Default if no priorities are set
        }

        const minPriority = Math.min(...priorities);
        return Math.max(minPriority - (existingTasks.length * 10), 1); // Ensure positive priority
    }
}