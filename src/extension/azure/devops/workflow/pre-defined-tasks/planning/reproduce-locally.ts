import { WorkItemType } from "../../../../../workflow/work-item-type";
import { PreDefinedTask } from "../pre-defined-task";

/**
 * Represents a pre-defined task for reproducing an issue locally to better understand the problem and identify potential solutions.
 */
export const ReproduceLocally: PreDefinedTask = {
    id: undefined,
    appliesTo: [WorkItemType.Bug],
    remainingWork: 1,
    assigneeRequired: true,
    name: 'Reproduce Locally',
    activity: 'Testing',
    description: 'Attempt to reproduce the issue locally to better understand the problem and identify potential solutions.'
};
