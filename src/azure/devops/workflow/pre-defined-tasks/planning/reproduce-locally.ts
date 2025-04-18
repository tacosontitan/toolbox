import { PreDefinedTask } from "../../pre-defined-task";
import { WorkItemType } from "../../../work-item-type";

/**
 * Represents a pre-defined task for reproducing an issue locally to better understand the problem and identify potential solutions.
 */
export const ReproduceLocally: PreDefinedTask = {
    id: undefined,
    appliesTo: [WorkItemType.Bug],
    remainingWork: 1,
    name: 'Reproduce Locally',
    description: 'Attempt to reproduce the issue locally to better understand the problem and identify potential solutions.'
};
