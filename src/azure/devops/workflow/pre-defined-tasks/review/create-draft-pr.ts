import { PreDefinedTask } from "../pre-defined-task";

/**
 * Represents a pre-defined task for creating draft pull request in Azure DevOps.
 */
export const CreateDraftPR: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 0.01,
    name: 'Create Draft PR',
    description: 'Create a draft pull request to initiate the code review process.'
};
