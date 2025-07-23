import { TaskTemplate } from '../task-template.schema';

/**
 * Maps task templates to Azure DevOps JSON patch documents for work item creation.
 */
export class PreDefinedTaskJsonPatchDocumentMapper {
    constructor(
        private readonly userDisplayName: string,
        private readonly organizationUri: string,
        private readonly parentWorkItemId: number,
        private readonly areaPath: string,
        private readonly iterationPath: string
    ) {}

    /**
     * Maps a task template to a JSON patch document for Azure DevOps work item creation.
     * @param task The task template to map
     * @returns The JSON patch document
     */
    public map(task: TaskTemplate): any[] {
        const patchDocument = [
            {
                op: "add",
                path: "/fields/System.Title",
                value: task.title
            },
            {
                op: "add",
                path: "/fields/System.Description",
                value: task.description
            },
            {
                op: "add",
                path: "/fields/Microsoft.VSTS.Scheduling.RemainingWork",
                value: task.remainingWork
            },
            {
                op: "add",
                path: "/fields/Microsoft.VSTS.Common.Activity",
                value: task.activity
            },
            {
                op: "add",
                path: "/fields/System.AreaPath",
                value: this.areaPath
            },
            {
                op: "add",
                path: "/fields/System.IterationPath",
                value: this.iterationPath
            },
            {
                op: "add",
                path: "/relations/-",
                value: {
                    rel: "System.LinkTypes.Hierarchy-Reverse",
                    url: `${this.organizationUri}/_apis/wit/workItems/${this.parentWorkItemId}`,
                    attributes: {
                        comment: "Making this task a child of the parent work item."
                    }
                }
            }
        ];

        // Add assignee if required
        if (task.metadata?.assigneeRequired) {
            patchDocument.push({
                op: "add",
                path: "/fields/System.AssignedTo",
                value: this.userDisplayName
            });
        }

        return patchDocument;
    }
}
