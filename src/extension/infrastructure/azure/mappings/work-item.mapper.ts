import { WorkItem as InfrastructureModel } from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";
import { Mapper } from "../../../core";
import { WorkItem as DomainModel, WorkItem, WorkItemState, WorkItemType } from "../../../domain/workflow";

/** @inheritdoc */
export class WorkItemMapper
    implements Mapper<InfrastructureModel, DomainModel> {

    /** @inheritdoc */
    map(input: InfrastructureModel): DomainModel {
        const id = input.id || 0;
        const title = this.getValue<string>(input, 'System.Title', "");
        const description = this.getValue<string>(input, 'System.Description', "");
        const remainingWork = this.getValue<number>(input, 'Microsoft.VSTS.Scheduling.RemainingWork', 0);
        const activity = this.getValue<string>(input, 'Microsoft.VSTS.Common.Activity', "");
        const result = new WorkItem(title, description, remainingWork, activity);

        const workItemType = this.getValue<string>(input, 'System.WorkItemType', "");
        result.type = new WorkItemType(workItemType);

        const workItemState = this.getValue<string>(input, 'System.State', "");
        result.state = new WorkItemState(workItemState);

        result.id = id;
        result.areaPath = this.getValue<string>(input, 'System.AreaPath', "");
        result.iterationPath = this.getValue<string>(input, 'System.IterationPath', "");
        return result;
    }

    private getValue<T>(input: InfrastructureModel, fieldName: string, defaultValue: T): T {
        return input.fields?.[fieldName] as T | undefined || defaultValue;
    }
}