import { Task } from "../../task";
import { WorkItemType } from "../../work-item-type";

/**
 * Represents a {@link Task} that is predefined as part of a workflow.
 */
export class PreDefinedTask
	extends Task {
	/**
	 * The {@link WorkItemType}(s) to which the {@link Task} applies.
	 */
	appliesTo: WorkItemType[];

	/**
	 * Creates a new {@link Task} with the specified details.
	 * @param name The name of the task.
	 * @param remainingWork The number of hours the task is estimated to take.
	 * @param appliesTo The work item type(s) to which the task applies.
	 * @param description The description of the task.
	 */
	constructor(name: string, remainingWork: number, appliesTo: WorkItemType[] = [], description: string = '') {
		super(name, description, remainingWork);
		this.appliesTo = appliesTo;
	}
}