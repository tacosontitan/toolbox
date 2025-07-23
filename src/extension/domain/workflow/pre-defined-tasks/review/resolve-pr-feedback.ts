import { PreDefinedTask } from "../pre-defined-task";

/**
 * Represents a pre-defined task for resolving feedback provided during the pull request review process in Azure DevOps.
 */
export const ResolvePRFeedback: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 1,
    assigneeRequired: true,
    title: 'Resolve PR Feedback',
    activity: 'Development',
    description: 'Address feedback provided during the pull request review process.'
};
