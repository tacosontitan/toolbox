import { JsonPatchDocument, JsonPatchOperation, Operation } from "azure-devops-node-api/interfaces/common/VSSInterfaces";
import { WorkItem as InfrastructureModel } from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";
import { WorkItem as DomainModel, WorkItem, WorkItemState, WorkItemType } from "../../../domain/workflow";

/** @inheritdoc */
export class WorkItemMapper {

    /** @inheritdoc */
    mapInfrastructureModelToDomainModel(input: InfrastructureModel): DomainModel {
        const id = input.id || 0;
        const title = this.getValue<string>(input, 'System.Title', "");
        const description = this.getValue<string>(input, 'System.Description', "");
        const remainingWork = this.getValue<number>(input, 'Microsoft.VSTS.Scheduling.RemainingWork', 0);
        const activity = this.getValue<string>(input, 'Microsoft.VSTS.Common.Activity', "");
        const workItemType = this.getValue<string>(input, 'System.WorkItemType', "");
        const workItem = new WorkItem(title, description, remainingWork, activity, new WorkItemType(workItemType));

        const workItemState = this.getValue<string>(input, 'System.State', "");
        workItem.changeState(new WorkItemState(workItemState));

        const assignedTo = this.getValue<string>(input, 'System.AssignedTo', "");
        workItem.assignTo(assignedTo);

        workItem.id = id;
        workItem.areaPath = this.getValue<string>(input, 'System.AreaPath', "");
        workItem.iterationPath = this.getValue<string>(input, 'System.IterationPath', "");
        return workItem;
    }

    mapDomainModelToJsonPatchDocument(input: DomainModel): JsonPatchDocument {
        const patchDocument: JsonPatchOperation[] = [];

        if (input.title) {
            patchDocument.push({ op: Operation.Add, path: "/title", value: input.title });
        }

        if (input.description) {
            patchDocument.push({ op: Operation.Add, path: "/description", value: input.description });
        }

        if (input.remainingWork) {
            patchDocument.push({ op: Operation.Add, path: "/remainingWork", value: input.remainingWork });
        }

        if (input.areaPath) {
            patchDocument.push({ op: Operation.Add, path: "/areaPath", value: input.areaPath });
        }

        if (input.iterationPath) {
            patchDocument.push({ op: Operation.Add, path: "/iterationPath", value: input.iterationPath });
        }

        if (input.assignedTo) {
            patchDocument.push({ op: Operation.Add, path: "/assignedTo", value: input.assignedTo });
        }

        if (input.type) {
            patchDocument.push({ op: Operation.Add, path: "/type", value: input.type.name });
        }

        if (input.state) {
            patchDocument.push({ op: Operation.Add, path: "/state", value: input.state.name });
        }

        if (input.activity) {
            patchDocument.push({ op: Operation.Add, path: "/activity", value: input.activity });
        }

        if (input.parent) {
            const relationship = {
                rel: "System.LinkTypes.Hierarchy",
                url: `/workitems/${input.parent.id}`,
                attributes: { comment: "Linked to parent work item by Hazel's toolbox in VS Code." }
            };

            patchDocument.push({ op: Operation.Add, path: "/relations/-", value: relationship });
        }

        return patchDocument;
    }

    private getValue<T>(input: InfrastructureModel, fieldName: string, defaultValue: T): T {
        return input.fields?.[fieldName] as T | undefined || defaultValue;
    }
}