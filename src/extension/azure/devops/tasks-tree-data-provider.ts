import * as vscode from 'vscode';
import { WorkItem } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import { IWorkItemDataService, TaskStateGroup } from '../../core/workflow/work-item-data.service.interface';
import { WorkItemTreeItem } from './work-item-tree-item';
import { TaskTreeItem } from './task-tree-item';
import { PlaceholderTreeItem } from './placeholder-tree-item';
import { StateGroupTreeItem } from './state-group-tree-item';

/**
 * Tree data provider for VS Code tree view focused only on UI presentation.
 * Uses IWorkItemDataService for data operations following separation of concerns.
 */
export class TasksTreeDataProvider implements vscode.TreeDataProvider<WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem | StateGroupTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem | StateGroupTreeItem | undefined | null | void> = new vscode.EventEmitter<WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem | StateGroupTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem | StateGroupTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private activeWorkItems: WorkItem[] = [];
    private workItemTasks: Map<number, WorkItem[]> = new Map();
    private stateGroupToWorkItem: Map<StateGroupTreeItem, number> = new Map();

    constructor(private workItemDataService: IWorkItemDataService) {
        // Load active work items on initialization
        this.refresh();
    }

    refresh(): void {
        // Load all active work items when refreshing using the data service
        this.workItemDataService.loadActiveWorkItems().then(workItems => {
            this.activeWorkItems = workItems;
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
                // Try to load tasks if not already loaded
                await this.loadTasksForWorkItem(workItemId);
                const loadedTasks = this.workItemTasks.get(workItemId) || [];
                if (loadedTasks.length === 0) {
                    return [new PlaceholderTreeItem("No tasks found", "This work item has no child tasks", 'info')];
                }
            }
            
            // Group tasks by state using the data service
            const currentTasks = this.workItemTasks.get(workItemId) || [];
            const stateGroups = await this.workItemDataService.groupTasksByState(currentTasks);
            const stateGroupItems = stateGroups.map(group => {
                const stateGroup = new StateGroupTreeItem(group.stateName, group.taskCount);
                this.stateGroupToWorkItem.set(stateGroup, workItemId);
                return stateGroup;
            });
            return stateGroupItems;
        }

        if (element instanceof StateGroupTreeItem) {
            // Show tasks under the state group
            const workItemId = this.stateGroupToWorkItem.get(element);
            if (!workItemId) {
                return [];
            }
            
            const tasks = this.workItemTasks.get(workItemId) || [];
            const filteredTasks = await this.workItemDataService.filterTasksByStateGroup(tasks, element.stateName);
            return filteredTasks.map(task => new TaskTreeItem(task));
        }

        return [];
    }

    /**
     * Loads tasks for a specific work item using the data service.
     */
    private async loadTasksForWorkItem(workItemId: number): Promise<void> {
        try {
            const tasks = await this.workItemDataService.loadTasksForWorkItem(workItemId);
            this.workItemTasks.set(workItemId, tasks);
        } catch (error) {
            console.error(`Failed to load tasks for work item ${workItemId}:`, error);
            this.workItemTasks.set(workItemId, []);
        }
    }

    getActiveWorkItems(): WorkItem[] {
        return this.activeWorkItems;
    }
}