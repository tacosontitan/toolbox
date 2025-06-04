import { PreDefinedTask } from "../pre-defined-task";

/**
 * Represents a pre-defined task for meeting with the noted subject matter expert to discuss the work item's implementation.
 */
export const MeetWithSme: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 0.5,
    assigneeRequired: true,
    name: 'Meet with Subject Matter Expert',
    activity: 'Requirements',
    description: 'Meet with the noted subject matter expert to discuss the work item\'s implementation.'
};
