import { PreDefinedTask } from "../pre-defined-task";

/**
 * Represents a pre-defined task for meeting with stakeholders to gather feedback and ensure alignment with expectations.
 */
export const MeetWithStakeholders: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 0.5,
    assigneeRequired: true,
    name: 'Meet with Stakeholders',
    activity: 'Requirements',
    description: 'Meet with stakeholders to gather feedback and ensure the work item aligns with their expectations.',
    requiredFields: [ 'Stakeholder' ]
};
