import { WorkItem } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';

/**
 * Domain service for managing work item data and business logic.
 * Separates data operations from UI tree presentation.
 */
export interface IWorkItemDataService {
    /**
     * Loads active work items assigned to the current user.
     */
    loadActiveWorkItems(): Promise<WorkItem[]>;

    /**
     * Loads tasks for a specific work item.
     */
    loadTasksForWorkItem(workItemId: number): Promise<WorkItem[]>;

    /**
     * Groups tasks by their state category.
     */
    groupTasksByState(tasks: WorkItem[]): Promise<TaskStateGroup[]>;

    /**
     * Filters tasks by state group.
     */
    filterTasksByStateGroup(tasks: WorkItem[], stateName: string): Promise<WorkItem[]>;
}

/**
 * Represents a group of tasks organized by state.
 */
export interface TaskStateGroup {
    stateName: string;
    tasks: WorkItem[];
    taskCount: number;
}