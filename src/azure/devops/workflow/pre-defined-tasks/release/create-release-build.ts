import { PreDefinedTask } from "../pre-defined-task";

/**
 * Represents a pre-defined task for creating a release build in Azure DevOps.
 */
export const CreateReleaseBuild: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 0.01,
    name: 'Create Release Build',
    description: 'Create a release build for deployment to production.'
};
