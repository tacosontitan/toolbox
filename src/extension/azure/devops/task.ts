/**
 * Represents a task in Azure DevOps.
 */
export interface Task {
	/**
	 * The unique identifier of the task.
	 */
	id: number | undefined;

	/**
	 * The name of the task.
	 */
	name: string;

	/**
	 * The description of the task.
	 */
	description: string;

	/**
	 * The number of hours the task is estimated to take.
	 */
	remainingWork: number;

	/**
	 * The activity associated with the task.
	 */
	activity: string;
}