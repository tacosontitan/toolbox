import { PreDefinedTask } from "../../pre-defined-task";

/**
 * Represents a pre-defined task to deploy the build to the test environment for QA validation in Azure DevOps.
 */
export const QADeploymentToTestEnvironment: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 2,
    name: 'QA Deployment to Test Environment',
    description: 'Deploy the build to the test environment for QA validation.'
};
