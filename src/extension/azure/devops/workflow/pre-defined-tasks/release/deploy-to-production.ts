import { PreDefinedTask } from "../pre-defined-task";

/**
 * Represents a pre-defined task for deploying the release build to the production environment in Azure DevOps.
 */
export const DeployToProduction: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 0.03,
    assigneeRequired: true,
    name: 'Deploy to Production',
    activity: 'Deployment',
    description: 'Deploy the release build to the production environment.'
};
