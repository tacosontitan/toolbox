import { PreDefinedTask } from "../pre-defined-task";

/**
 * Represents a pre-defined task to support the QA team during the smoke-testing process in Azure DevOps.
 */
export const SupportSmokeTesting: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 0.25,
    assigneeRequired: true,
    name: 'Support Smoke Testing',
    activity: 'Testing',
    description: 'Provide support during smoke testing to address any issues that arise.'
};
