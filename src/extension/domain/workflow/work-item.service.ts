import { WorkItem } from "./work-item";
import { WorkItemState } from "./work-item-state";
import { WorkItemType } from "./work-item-type";

/**
 * Represents a service for managing work items in a workflow.
 */
export interface IWorkItemService {
    /**
     * Retrieves a work item by its unique identifier.
     * @param workItemId The unique identifier of the work item to retrieve.
     * @returns A promise that resolves to the work item if found, or null if not found.
     */
    getWorkItem(workItemId: number): Promise<WorkItem | null>;

    /**
     * Starts a work item.
     * @param workItemId The unique identifier of the work item to start.
     * @returns A promise that resolves to the started work item.
     */
    start(workItemId: number): Promise<WorkItem | null>;

    /**
     * Creates a new task under the specified parent work item.
     * @param parentWorkItemId The unique identifier of the parent work item.
     * @param title The title of the new task.
     * @param description The description of the new task (optional).
     * @returns A promise that resolves when the task is created.
     */
    createTask(parentWorkItemId: number, title: string, description?: string): Promise<void>;

    /**
     * Updates the state of a work item.
     * @param workItemId The unique identifier of the work item.
     * @param newState The new state to set.
     * @returns A promise that resolves when the state is updated.
     */
    updateWorkItemState(workItemId: number, newState: string): Promise<void>;

    /**
     * Gets the available states for a work item type.
     * @param workItemType The type of work item (e.g., 'Task', 'User Story', 'Bug').
     * @returns A promise that resolves to an array of available state names.
     */
    getAvailableStates(workItemType: WorkItemType): Promise<WorkItemState[]>;
}