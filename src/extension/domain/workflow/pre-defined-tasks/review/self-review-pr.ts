import { PreDefinedTask } from "../pre-defined-task";

/**
 * Represents a pre-defined task for self-reviewing a pull request in Azure DevOps.
 */
export const SelfReviewPR: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 0.5,
    assigneeRequired: true,
    title: 'Self-Review PR',
    activity: 'Development',
    description: 'Perform a self-review of the pull request to ensure code quality and completeness.'
};
