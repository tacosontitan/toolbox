import { WorkItem } from "./work-item";
import { WorkItemType } from "./work-item-type";

/**
 * Represents a task in Azure DevOps.
 */
export class Task extends WorkItem {
	/**
	 * Creates a new task instance with the specified details.
	 * @param title The title of the task.
	 * @param description The description of the task.
	 * @param remainingWork The number of hours the task is estimated to take.
	 * @param activity The activity associated with the task.
	 */
	constructor(
		title: string,
		description: string,
		remainingWork: number,
		activity: string
	) {
		super(title, description, remainingWork, activity, WorkItemType.Task);
	}
}