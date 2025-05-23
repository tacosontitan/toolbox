import { PreDefinedTask } from "../pre-defined-task";

/**
 * Represents a pre-defined task for publishing a pull request in Azure DevOps.
 */
export const PublishPR: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 0.01,
    assigneeRequired: true,
    name: 'Publish PR',
    activity: 'Development',
    description: 'Publish the pull request for review by other team members.'
};
