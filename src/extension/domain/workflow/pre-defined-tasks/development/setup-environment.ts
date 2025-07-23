import { PreDefinedTask } from "../pre-defined-task";

/**
 * Represents a pre-defined task for setting up the development environment.
 */
export const SetupEnvironment: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 0.15,
    assigneeRequired: true,
    title: 'Setup Environment',
    activity: 'Development',
    description: `Setup the development environment to execute the work item.
- Download repository.
- Run any tests against main.
- Create topic branch.
- Install dependencies.`
};
