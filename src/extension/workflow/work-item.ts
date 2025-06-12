import { WorkItemState } from "./work-item-state";
import { WorkItemType } from "./work-item-type";

/**
 * Represents a work item in Azure DevOps.
 */
export class WorkItem {
    /**
     * The unique identifier of the work item.
     */
    public id: number | undefined;

    /**
     * The title of the work item.
     */
    public title: string;

    /**
     * The description of the work item.
     */
    public description: string;

    /**
     * The number of hours the work item is estimated to take.
     */
    public remainingWork: number;

    /**
     * The activity associated with the work item.
     */
    public activity: string;

    /**
     * The state of the work item.
     */
    public state: WorkItemState | undefined = undefined;

    /**
     * The type of the work item.
     * This can be a specific work item type like "Bug", "User Story", etc.
     */
    public type: WorkItemType | undefined = undefined;

    /**
     * The additional fields associated with the work item.
     */
    public additionalFields: { [key: string]: any } = {};

    /**
     * Creates a new work item instance with the specified details.
     * @param title The title of the work item.
     * @param description The description of the work item.
     * @param remainingWork The number of hours the work item is estimated to take.
     * @param activity The activity associated with the work item.
     */
    constructor(
        title: string,
        description: string,
        remainingWork: number,
        activity: string
    ) {
        this.title = title;
        this.description = description;
        this.remainingWork = remainingWork;
        this.activity = activity;
    }
}