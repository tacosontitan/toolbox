import { WorkItem } from "./work-item";
import { WorkItemActivity } from "./work-item-activity";
import { WorkItemType } from "./work-item-type";

/**
 * Represents a task in Azure DevOps.
 */
export class Task
	extends WorkItem {

	/**
	 * The number of hours the task is estimated to take.
	 */
	private remainingWork: number = 0;

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
		const type = new WorkItemType("Task");
		const taskActivity = new WorkItemActivity(activity);
		super(name, type, description, taskActivity);

		this.IncreaseRemainingWork(remainingWork);
	}

	/**
	 * Gets the number of hours the task is estimated to take.
	 * @returns The number of hours the task is estimated to take.
	 * @readonly
	 */
	public get RemainingWork(): number {
		return this.remainingWork;
	}

	/**
	 * Increases the remaining work by the specified number of hours.
	 * @param hours The number of hours to add to the remaining work.
	 */
	public IncreaseRemainingWork(hours: number): void {
		this.remainingWork += hours;
	}

	/**
	 * Decreases the remaining work by the specified number of hours.
	 * @param hours The number of hours to subtract from the remaining work.
	 */
	public DecreaseRemainingWork(hours: number): void {
		this.remainingWork -= hours;
		if (this.remainingWork < 0) {
			this.remainingWork = 0;
		}
	}
}