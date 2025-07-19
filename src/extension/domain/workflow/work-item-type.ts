/**
 * Represents a work item type in Azure DevOps.
 */
export class WorkItemType {
	/**
	 * The name of the work item type.
	 * @example "Bug"
	 */
	public name: string;

	/**
	 * Creates a new work item type instance with the specified name.
	 * @param name The name of the work item type.
	 */
	constructor(name: string) {
		this.name = name;
	}

	/**
	 * Represents the "task" work item type.
	 */
	public static Task = new WorkItemType('Task');

	/**
	 * Represents the "bug" work item type.
	 */
	public static Bug = new WorkItemType('Bug');

	/**
	 * Represents the "user story" work item type.
	 */
	public static UserStory = new WorkItemType('User Story');
}
