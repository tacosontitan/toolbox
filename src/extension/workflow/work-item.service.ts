import { WorkItem } from "./work-item";

/**
 * Represents a service for managing work items in a workflow.
 */
export interface IWorkItemService {
    /**
     * Starts a work item.
     * @param workItemId The unique identifier of the work item to start.
     * @returns A promise that resolves to the started work item.
     */
    start(workItemId: number): Promise<WorkItem>;
}