/**
 * Defines members for managing workflow operations.
 */
export abstract class IWorkflowService {
    /**
     * Starts the specified work item if it exists and not already started.
     * @param workItemId The ID of the work item to start.
     * @returns A promise that resolves when the work item has been started.
     */
    abstract start(workItemId: number): Promise<void>;
}