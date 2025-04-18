import { PreDefinedTask } from "../../pre-defined-task";

/**
 * Represents a pre-defined task for executing test cases in Azure DevOps.
 */
export const QATestCaseExecution: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 1,
    name: 'QA Test Case Execution',
    description: 'Execute the test cases to validate the functionality of the work item.'
};
