import { PreDefinedTask } from "../pre-defined-task";

/**
 * Represents a pre-defined task for notifying stakeholders about the deployment to production in Azure DevOps.
 */
export const NotifyStakeholdersOfDeployment: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 0.05,
    name: 'Notify Stakeholders of Deployment',
    description: 'Notify stakeholders about the deployment to production and its status.'
};
