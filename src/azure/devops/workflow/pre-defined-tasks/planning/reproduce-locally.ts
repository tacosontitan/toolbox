import { PreDefinedTask } from "../../pre-defined-task";
import { WorkItemType } from "../../../work-item-type";

export const ReproduceLocally: PreDefinedTask = {
    id: undefined,
    appliesTo: [WorkItemType.Bug],
    remainingWork: 1,
    name: 'Reproduce Locally',
    description: 'Attempt to reproduce the issue locally to better understand the problem and identify potential solutions.'
};
