import { PreDefinedTask } from "../pre-defined-task";

/**
 * Represents a pre-defined task to support the QA team during the testing process in Azure DevOps.
 */
export const SupportQATesting: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 1,
    assigneeRequired: true,
    name: 'Support QA Testing',
    activity: 'Testing',
    description: 'Provide support to the QA team during the testing process.'
};
