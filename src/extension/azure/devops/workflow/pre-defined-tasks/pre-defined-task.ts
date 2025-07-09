import { Task } from "../../task";
import { WorkItemType } from "../../work-item-type";

/**
 * Represents a {@link Task} that is predefined as part of a workflow.
 */
export interface PreDefinedTask extends Task {
	/**
	 * Indicates whether the task should be have an assignee by default.
	 */
	assigneeRequired: boolean;

	/**
	 * The {@link WorkItemType}(s) to which the {@link Task} applies.
	 */
	appliesTo: WorkItemType[];

	/**
	 * The fields that must have values for the task to be created.
	 */
	requiredFields?: string[];
}