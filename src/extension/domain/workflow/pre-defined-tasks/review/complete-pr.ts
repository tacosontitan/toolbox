import { PreDefinedTask } from "../pre-defined-task";

/**
 * Represents a pre-defined task to complete the pull request after all validations and reviews are successful in Azure DevOps.
 */
export const CompletePR: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 0.01,
    assigneeRequired: true,
    title: 'Complete PR',
    activity: 'Development',
    description: 'Complete the pull request after all validations and reviews are successful.'
};
