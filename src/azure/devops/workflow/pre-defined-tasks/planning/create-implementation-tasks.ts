import { PreDefinedTask } from "../pre-defined-task";

/**
 * Represents a pre-defined task to create tasks for implementing the changes needed to meet a work item's acceptance criteria.
 */
export const CreateImplementationTasks: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 0.5,
    name: 'Create Implementation Tasks',
    description: 'After conducting the necessary reviews and meetings, create tasks that represent the steps needed to execute the work item\'s acceptance criteria (be sure to account for non-functional requirements).'
};
