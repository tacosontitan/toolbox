/**
 * Represents a work item activity in Azure DevOps.
 */
export class WorkItemActivity {
	/**
	 * The name of the work item activity.
	 * @example "Development"
	 */
	public name: string;

	/**
	 * Creates a new work item activity instance with the specified name.
	 * @param name The name of the work item activity.
	 */
	constructor(name: string) {
		this.name = name;
	}

	/**
	 * Represents the "task" work item activity.
	 */
	public static Development = new WorkItemActivity('Development');
}