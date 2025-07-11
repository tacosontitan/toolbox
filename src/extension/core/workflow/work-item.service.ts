import { WorkItem } from "./work-item";
import { WorkItemState } from "./work-item-state";

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
     * Retrieves child work items for a parent work item.
     * @param parentWorkItemId The unique identifier of the parent work item.
     * @returns A promise that resolves to an array of child work items.
     */
    getChildWorkItems(parentWorkItemId: number): Promise<WorkItem[]>;

    /**
     * Changes the state of a work item.
     * @param workItem The work item to update.
     * @param state The new state for the work item.
     * @returns A promise that resolves when the state change is complete.
     */
    changeWorkItemState(workItem: WorkItem, state: WorkItemState): Promise<void>;
}