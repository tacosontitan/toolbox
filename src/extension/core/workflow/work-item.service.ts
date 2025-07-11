import { WorkItem } from "./work-item";

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
}