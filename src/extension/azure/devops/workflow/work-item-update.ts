import { JsonPatchDocument, JsonPatchOperation, Operation } from "azure-devops-node-api/interfaces/common/VSSInterfaces";
import { WorkItem } from "../../../workflow";

export class WorkItemUpdate {
    private operations: JsonPatchOperation[] = [];

    constructor(private readonly organizationUri: string) { }

    public generatePatchDocument(): JsonPatchDocument {
        return this.operations;
    }

    /**
     * Sets the title of the work item.
     * @param title The title of the work item to set.
     * @returns The updated WorkItemUpdate instance.
     */
    setTitle(title: string): WorkItemUpdate {
        return this.addField('/fields/System.Title', title);
    }

    /**
     * Sets the description of the work item.
     * @param description The description of the work item to set.
     * @returns The updated WorkItemUpdate instance.
     */
    setDescription(description: string): WorkItemUpdate {
        return this.addField('/fields/System.Description', description);
    }

    /**
     * Sets the remaining work hours for the work item.
     * @param remainingWork The number of hours remaining for the work item.
     * @returns The updated WorkItemUpdate instance.
     */
    setRemainingWork(remainingWork: number): WorkItemUpdate {
        return this.addField('/fields/Microsoft.VSTS.Scheduling.RemainingWork', remainingWork);
    }

    /**
     * Sets the area path for the work item.
     * @param areaPath The area path to set for the work item.
     * @returns The updated WorkItemUpdate instance.
     */
    setAreaPath(areaPath: string): WorkItemUpdate {
        return this.addField('/fields/System.AreaPath', areaPath);
    }

    /**
     * Sets the iteration path for the work item.
     * @param iterationPath The iteration path to set for the work item.
     * @returns The updated WorkItemUpdate instance.
     */
    setIterationPath(iterationPath: string): WorkItemUpdate {
        return this.addField('/fields/System.IterationPath', iterationPath);
    }

    /**
     * Sets the assigned user for the work item.
     * @param assignedTo The display name of the user to assign the work item to.
     * @returns The updated WorkItemUpdate instance.
     */
    setAssignedTo(assignedTo: string): WorkItemUpdate {
        return this.addField('/fields/System.AssignedTo', assignedTo);
    }

    /**
     * Sets the activity for the work item.
     * @param activity The activity to set for the work item.
     * @returns The updated WorkItemUpdate instance with the activity set.
     */
    setActivity(activity: string): WorkItemUpdate {
        return this.addField('/fields/Microsoft.VSTS.Common.Activity', activity);
    }

    /**
     * Adds a parent work item relation to the work item.
     * @param workItem The work item to add as a parent.
     * @returns The updated WorkItemUpdate instance with the parent work item added.
     */
    addParentWorkItem(workItem: WorkItem): WorkItemUpdate {
        this.operations.push({
            op: Operation.Add,
            path: '/relations/-',
            value: {
                rel: 'System.LinkTypes.Hierarchy-Reverse',
                url: `${this.organizationUri}/_apis/wit/workItems/${workItem.id}`,
                attributes: {
                    comment: 'Parent work item',
                },
            },
        });

        return this;
    }

    /**
     * Adds a field update operation to the work item.
     * @param path The path to the field to update.
     * @param value The new value for the field.
     * @returns The updated WorkItemUpdate instance.
     */
    private addField(path: string, value: any): WorkItemUpdate {
        this.operations.push({
            op: Operation.Add,
            path,
            value
        });

        return this;
    }
}