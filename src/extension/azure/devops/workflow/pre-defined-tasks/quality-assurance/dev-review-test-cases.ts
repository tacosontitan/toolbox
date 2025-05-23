import { PreDefinedTask } from "../pre-defined-task";

/**
 * Represents a pre-defined task for the developer review of test cases in Azure DevOps.
 */
export const DevReviewTestCases: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 0.5,
    assigneeRequired: true,
    name: 'Dev Review Test Cases',
    activity: 'Requirements',
    description: 'Review the test cases to ensure they are correct, comprehensive, and cover all scenarios.'
};
