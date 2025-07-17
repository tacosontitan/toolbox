/**
 * Defines options for workflow management in the extension.
 */
export interface WorkflowOptions {
    /**
	 * Indicates whether or not inactive tasks should be displayed when available.
	 */
    showInactiveTasks: boolean;

    /**
	 * Contains states that indicate a work item is considered inactive.
	 *
	 * @remarks This is used to filter out work items that are not currently being worked on.
	 */
    inactiveStates: string[];

    /**
	 * The state used to indicate that a task is ready to be worked on.
	 */
    taskReadyState: string;

    /**
	 * The state used to indicate that a task is currently being worked on.
	 */
    taskDoingState: string;

    /**
	 * The state used to indicate that a task has been completed.
	 */
    taskDoneState: string;

	/**
	 * The state used to indicate that a work item has been started.
	 */
    workItemStartedState: string;
}