import { PreDefinedTask } from "../pre-defined-task";

/**
 * Represents a pre-defined task to review the work item and all pre-defined tasks to ensure that tasks are aligned with business objectives and add tasks if necessary.
 */
export const ReviewFeature: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 0.5,
    assigneeRequired: true,
    name: 'Review Feature',
    activity: 'Requirements',
    description: 'Review the feature and its associated work items to ensure alignment with business objectives, coordination with team members, and add tasks if necessary.'
};
