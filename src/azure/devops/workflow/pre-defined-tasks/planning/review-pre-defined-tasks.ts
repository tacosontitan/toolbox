import { PreDefinedTask } from "../pre-defined-task";

/**
 * Represents a pre-defined task for ensuring that pre-defined tasks are aligned with the objectives of the work item and that the remaining work for each task is accurate.
 */
export const ReviewPreDefinedTasks: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 0.15,
    assigneeRequired: true,
    name: 'Review Pre-Defined Tasks',
    activity: 'Requirements',
    description: 'Review the pre-defined tasks to ensure they align with the objectives of the work item and that the remaining work for each task is accurate.'
};