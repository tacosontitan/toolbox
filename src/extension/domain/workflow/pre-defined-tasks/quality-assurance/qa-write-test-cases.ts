import { PreDefinedTask } from "../pre-defined-task";

/**
 * Represents a pre-defined task for writing test cases in Azure DevOps.
 */
export const QAWriteTestCases: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 2,
    assigneeRequired: false,
    name: 'QA Write Test Cases',
    activity: 'Design',
    description: 'Write test cases that are comprehensive and aligned with business objectives.'
};
