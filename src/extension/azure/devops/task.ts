/**
 * Represents a task in Azure DevOps.
 */
export class Task {
	/**
	 * The unique identifier of the task.
	 */
	public id: number | undefined;

	/**
	 * The name of the task.
	 */
	public name: string;

	/**
	 * The description of the task.
	 */
	public description: string;

	/**
	 * The number of hours the task is estimated to take.
	 */
	public remainingWork: number;

	/**
	 * The activity associated with the task.
	 */
	public activity: string;

	/**
	 * Creates a new task instance with the specified details.
	 * @param name The name of the task.
	 * @param description The description of the task.
	 * @param remainingWork The number of hours the task is estimated to take.
	 * @param activity The activity associated with the task.
	 */
	constructor(
		name: string,
		description: string,
		remainingWork: number,
		activity: string
	) {
		this.name = name;
		this.description = description;
		this.remainingWork = remainingWork;
		this.activity = activity;
	}
}