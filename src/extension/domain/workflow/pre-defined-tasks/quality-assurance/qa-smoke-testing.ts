import { PreDefinedTask } from "../pre-defined-task";

/**
 * Represents a pre-defined task for smoke testing in Azure DevOps.
 */
export const QASmokeTesting: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 0.5,
    assigneeRequired: false,
    name: 'QA Smoke Testing',
    activity: 'Testing',
    description: 'Perform smoke testing to validate the stability of the build in the test environment.'
};
