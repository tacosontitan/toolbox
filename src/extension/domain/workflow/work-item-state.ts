/**
 * Represents a work item state in Azure DevOps.
 */
export class WorkItemState {
	/**
	 * The name of the work item state.
	 * @example "Planning"
	 */
	public name: string;

	/**
	 * Creates a new work item state instance with the specified name.
	 * @param name The name of the work item state.
	 */
	constructor(name: string) {
		this.name = name;
	}

	/**
	 * Represents the "new" work item state.
	 */
	public static New = new WorkItemState('New');

	/**
	 * Represents the "approved" work item state.
	 */
	public static Approved = new WorkItemState('Approved');
    /**
     * Represents the "planning" work item state.
     */
    public static Planning = new WorkItemState('Planning');

	/**
	 * Represents the "development" work item state.
	 */
	public static Development = new WorkItemState('Development');

	/**
	 * Represents the "ready for testing" work item state.
	 */
	public static ReadyForTesting = new WorkItemState('Ready for Testing');

	/**
	 * Represents the "testing" work item state.
	 */
	public static Testing = new WorkItemState('Testing');

	/**
	 * Represents the "release" work item state.
	 */
	public static Release = new WorkItemState('Release');

	/**
	 * Represents the "smoke testing" work item state.
	 */
	public static SmokeTesting = new WorkItemState('Smoke Testing');

	/**
	 * Represents the "deployment" work item state.
	 */
	public static Deployment = new WorkItemState('Deployment');

	/**
	 * Represents the "support" work item state.
	 */
	public static Support = new WorkItemState('Support');

	/**
	 * Represents the "closed" work item state.
	 */
	public static Closed = new WorkItemState('Closed');

	/**
	 * Represents the "to do" work item state.
	 */
	public static ToDo = new WorkItemState('To Do');

	/**
	 * Represents the "doing" work item state.
	 */
	public static Doing = new WorkItemState('Doing');

	/**
	 * Represents the "done" work item state.
	 */
	public static Done = new WorkItemState('Done');
}