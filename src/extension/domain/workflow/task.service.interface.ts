import { WorkItem } from './work-item';

/**
 * Defines the contract for a service that manages tasks.
 */
export interface ITaskService {
    /**
     * Gets the default tasks that should be created for a specific work item.
     * @param workItem The work item to get default tasks for.
     * @returns An array of task work items that should be added as children.
     */
    getDefaultTasksForWorkItem(workItem: WorkItem): WorkItem[];
}
