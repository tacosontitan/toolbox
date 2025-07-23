import { WorkItemType } from "../work-item-type";

/**
 * Represents a task template that is predefined as part of a workflow.
 */
export interface PreDefinedTask {
	/**
	 * The unique identifier of the task.
	 */
	id: number | undefined;

	/**
	 * The title of the task.
	 */
	title: string;

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

	/**
	 * Indicates whether the task should have an assignee by default.
	 */
	assigneeRequired: boolean;

	/**
	 * The {@link WorkItemType}(s) to which the task applies.
	 */
	appliesTo: WorkItemType[];

	/**
	 * The fields that must have values for the task to be created.
	 */
	requiredFields?: string[];
}