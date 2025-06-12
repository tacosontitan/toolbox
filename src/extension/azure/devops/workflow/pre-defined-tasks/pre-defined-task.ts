import { WorkItemType } from "../../../../workflow/work-item-type";
import { Task } from "../../task";

/**
 * Represents a {@link Task} that is predefined as part of a workflow.
 */
export class PreDefinedTask
	extends Task {

	/**
	 * Indicates whether the task should be have an assignee by default.
	 */
	assigneeRequired: boolean = true;

	/**
	 * The {@link WorkItemType}(s) to which the {@link Task} applies.
	 */
	appliesTo: WorkItemType[];

	/**
	 * The fields that must have values for the task to be created.
	 */
	requiredFields?: string[];

	/**
	 * Creates a new {@link Task} with the specified details.
	 * @param name The name of the task.
	 * @param remainingWork The number of hours the task is estimated to take.
	 * @param activity The activity associated with the task.
	 * @param appliesTo The work item type(s) to which the task applies.
	 * @param description The description of the task.
	 * @param requiredFields The fields that must have values for the task to be created.
	 */
	constructor(
		name: string,
		remainingWork: number,
		activity: string,
		appliesTo: WorkItemType[] = [],
		description: string = '',
		requiredFields?: string[]
	) {
		super(name, description, remainingWork, activity);
		this.appliesTo = appliesTo;
		this.requiredFields = requiredFields;
	}
}