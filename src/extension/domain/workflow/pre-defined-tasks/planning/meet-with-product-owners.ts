import { PreDefinedTask } from "../pre-defined-task";

/**
 * Represents a pre-defined task for meeting with product owners to ensure alignment with business objectives.
 */
export const MeetWithProductOwners: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 0.5,
    assigneeRequired: true,
    title: 'Meet with Product Owners',
    activity: 'Requirements',
    description: 'Meet with product owners to clarify requirements and ensure alignment with business objectives.'
};
