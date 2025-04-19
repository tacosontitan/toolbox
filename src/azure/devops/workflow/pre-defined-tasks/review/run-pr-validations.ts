import { PreDefinedTask } from "../pre-defined-task";

/**
 * Represents a pre-defined task for running validations for the pull request in Azure DevOps.
 */
export const RunPRValidations: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 0.01,
    name: 'Run PR Validations',
    activity: 'Development',
    description: 'Run automated validations for the pull request to ensure compliance with standards.'
};
