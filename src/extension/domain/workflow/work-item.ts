import { getDefaultTasks } from "./default-tasks";
import { Task } from "./task";
import { WorkItemState } from "./work-item-state";
import { WorkItemType } from "./work-item-type";

/**
 * Represents a work item in Azure DevOps.
 */
export class WorkItem {
    private parentWorkItem: WorkItem | undefined = undefined;
    private currentState: WorkItemState | undefined = undefined;
    private previousState: WorkItemState | undefined = undefined;
    private assignedUserDisplayName: string | undefined;
    private linkedChildren: WorkItem[] = [];

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
     * The type of the work item.
     * This can be a specific work item type like "Bug", "User Story", etc.
     */
    public type: WorkItemType;

    /**
     * The area path of the work item.
     */
    public areaPath: string | undefined = undefined;

    /**
     * The iteration path of the work item.
     */
    public iterationPath: string | undefined = undefined;

    /**
     * The additional fields associated with the work item.
     */
    public additionalFields: { [key: string]: any } = {};

    /**
     * @constructor
     * @param title The title of the work item.
     * @param description The description of the work item.
     * @param remainingWork The number of hours the work item is estimated to take.
     * @param activity The activity associated with the work item.
     */
    constructor(
        title: string,
        description: string,
        remainingWork: number,
        activity: string,
        type: WorkItemType
    ) {
        this.title = title;
        this.description = description;
        this.remainingWork = remainingWork;
        this.activity = activity;
        this.type = type;
    }

    /**
     * Gets the parent of the work item.
     * @return The parent work item, or undefined if there is no parent.
     */
    public get parent(): WorkItem | undefined {
        return this.parentWorkItem;
    }

    /**
     * Gets the current state of the work item.
     * @returns The current state of the work item.
     */
    public get state(): WorkItemState | undefined {
        return this.currentState;
    }

    /**
     * Gets the display name of the user to whom the work item is assigned.
     * @returns The display name of the user to whom the work item is assigned.
     */
    public get assignedTo(): string | undefined {
        return this.assignedUserDisplayName;
    }

    /**
     * Gets the children of this work item.
     * @returns An array of child work items.
     */
    public get children(): WorkItem[] {
        return this.linkedChildren;
    }

    /**
     * Starts the work item.
     * @param startingState The state to set when starting the work item.
     */
    public async start(startingState: string): Promise<void> {
        if (this.previousState || this.linkedChildren?.length > 0) {
            throw new Error("Work item is already started.");
        }

        this.currentState = new WorkItemState(startingState);
        this.previousState = this.currentState;
        
        // Load default tasks from JSON templates
        const defaultTasks = await getDefaultTasks();
        
        for (const taskTemplate of defaultTasks) {
            const task = new Task(taskTemplate.title, taskTemplate.description, taskTemplate.remainingWork, taskTemplate.activity);
            this.addChild(task);
        }
    }

    /**
     * Changes the state of the work item.
     * @param state The new state to set for the work item.
     * @throws Error if the work item is already in the specified state.
     */
    public changeState(state: WorkItemState): void {
        if (this.currentState?.name === state.name) {
            throw new Error(`Work item is already in the ${state.name} state.`);
        }

        this.previousState = this.currentState;
        this.currentState = state;
    }

    /**
     * Assigns the work item to a user.
     * @param user The display name of the user to whom the work item is assigned.
     */
    public assignTo(user: string): void {
        if (this.assignedUserDisplayName) {
            throw new Error("Work item is already assigned to a user; you must transfer it instead.");
        }

        this.assignedUserDisplayName = user;
    }
    /**
     * Transfers the work item to a different user.
     * @param user The display name of the user to whom the work item is transferred.
     */
    public transferTo(user: string): void {
        if (!this.assignedUserDisplayName) {
            throw new Error("Work item is not assigned to any user; you must assign it first.");
        }

        this.assignedUserDisplayName = user;
    }

    /**
     * Adds a child work item.
     * @param child The child work item to add.
     */
    public addChild(child: WorkItem): void {
        if (this.linkedChildren.some(c => c.id === child.id)) {
            throw new Error("Child work item with the same ID already exists.");
        }

        if (child.id === this.id) {
            throw new Error("A work item cannot be a child of itself.");
        }

        child.parentWorkItem = this;
        child.areaPath = this.areaPath;
        child.iterationPath = this.iterationPath;
        this.linkedChildren.push(child);
    }
}