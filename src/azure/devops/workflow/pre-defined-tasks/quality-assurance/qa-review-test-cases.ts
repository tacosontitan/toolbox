import { PreDefinedTask } from "../../pre-defined-task";

/**
 * Represents a pre-defined task for quality assurance to cross-review test cases in Azure DevOps.
 */
export const QAReviewTestCases: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 0.5,
    name: 'QA Review Test Cases',
    description: 'Review the test cases to ensure they are correct, comprehensive, and cover all scenarios.'
};
