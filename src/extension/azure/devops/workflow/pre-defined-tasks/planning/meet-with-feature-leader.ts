import { PreDefinedTask } from "../pre-defined-task";

/**
 * Represents a pre-defined task for meeting with the feature leader to discuss the work item's scope within the grand scheme of the feature.
 */
export const MeetWithFeatureLeader: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 0.5,
    assigneeRequired: true,
    name: 'Meet with Feature Leader',
    activity: 'Requirements',
    description: 'Meet with the feature leader to discuss the work item\'s scope within the grand scheme of the feature.'
};
