import { WorkItemActivity } from "./work-item-activity";
import { WorkItemType } from "./work-item-type";

/**
 * Represents a work item in Azure DevOps.
 */
export class WorkItem {
    private number: number | undefined;
    private title: string;
    private type: WorkItemType;
    private description: string | undefined;
    private activity: WorkItemActivity | undefined;
    private links: WorkItem[] = [];

    /**
     * Creates a new work item.
     * @param title The title of the work item.
     * @param type The type of the work item.
     * @param description The description of the work item.
     * @param activity The activity associated with the work item.
     * @constructor
     */
    constructor(title: string, type: WorkItemType, description?: string, activity?: WorkItemActivity) {
        this.title = title;
        this.type = type;
        this.description = description;
        this.activity = activity;
    }

    /**
     * Gets the number of the work item.
     * @returns The number of the work item, or undefined if not set.
     * @readonly
     */
    public get Number(): number | undefined {
        return this.number;
    }

    /**
     * Gets the title of the work item.
     * @returns The title of the work item.
     * @readonly
     */
    public get Title(): string {
        return this.title;
    }

    /**
     * Gets the type of the work item.
     * @returns The type of the work item.
     * @readonly
     */
    public get Type(): WorkItemType {
        return this.type;
    }

    /**
     * Gets the description of the work item.
     * @returns The description of the work item, or undefined if not set.
     * @readonly
     */
    public get Description(): string | undefined {
        return this.description;
    }

    /**
     * Gets the activity of the work item.
     * @returns The activity of the work item, or undefined if not set.
     * @readonly
     */
    public get Activity(): WorkItemActivity | undefined {
        return this.activity;
    }

    /**
     * Gets the links associated with the work item.
     * @returns A read-only array of linked work items.
     * @readonly
     */
    public get Links(): readonly WorkItem[] {
        return this.links;
    }

    /**
     * Adds a link to another work item.
     * @param workItem The work item to add as a link.
     */
    public AddLink(workItem: WorkItem): void {
        this.links.push(workItem);
    }

    /**
     * Removes a link from another work item.
     * @param workItem The work item to remove from the links.
     */
    public RemoveLink(workItem: WorkItem): void {
        this.links = this.links.filter(link => link !== workItem);
    }
}