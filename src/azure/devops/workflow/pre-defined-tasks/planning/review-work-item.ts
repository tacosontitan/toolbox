import { PreDefinedTask } from "../pre-defined-task";

/**
 * Represents a pre-defined task to review the work item and all pre-defined tasks to ensure that tasks are aligned with business objectives and add tasks if necessary.
 */
export const ReviewWorkItem: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 0.5,
    name: 'Review Work Item',
    description: 'Review the work item and all pre-defined tasks to ensure that tasks are aligned with business objectives and add tasks if necessary.'
};
