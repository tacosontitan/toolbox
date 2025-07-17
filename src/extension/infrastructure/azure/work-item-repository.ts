import * as devops from "azure-devops-node-api";
import { WebApi } from "azure-devops-node-api";
import { WorkItemTrackingApi } from "azure-devops-node-api/WorkItemTrackingApi";
import { IRepository } from "../../core/repository";
import { WorkItem, WorkItemState, WorkItemType } from "../../domain/workflow";
import { DevOpsService } from "./devops-service";

/** @inheritdoc */
export class AzureDevOpsWorkItemRepository implements IRepository<WorkItem> {
    constructor(
        private readonly devOpsService: DevOpsService
    ) { }

    /** @inheritdoc */
    async getById(id: number): Promise<WorkItem | undefined>
    {
        const workItemTrackingClient = await this.getWorkItemTrackingClient();
        const parentWorkItem = await workItemTrackingClient.getWorkItem(id);
        const title = parentWorkItem.fields?.['System.Title'] as string;
        const description = parentWorkItem.fields?.['System.Description'] as string || "";
        const remainingWork = parentWorkItem.fields?.['Microsoft.VSTS.Scheduling.RemainingWork'] as number || 0;
        const activity = parentWorkItem.fields?.['Microsoft.VSTS.Common.Activity'] as string || "";
        const result = new WorkItem(title, description, remainingWork, activity);
        result.id = id;
        result.type = new WorkItemType(parentWorkItem.fields?.['System.WorkItemType'] as string);
        result.state = new WorkItemState(parentWorkItem.fields?.['System.State'] as string);
        result.areaPath = parentWorkItem.fields?.['System.AreaPath'] as string;
        result.iterationPath = parentWorkItem.fields?.['System.IterationPath'] as string;
        return result;
    }

    /** @inheritdoc */
    create(item: WorkItem): Promise<WorkItem> {
        throw new Error("Method not implemented.");
    }

    /** @inheritdoc */
    update(item: WorkItem): Promise<WorkItem> {
        throw new Error("Method not implemented.");
    }

    /** @inheritdoc */
    delete(id: number): Promise<void> {
        throw new Error("Method not implemented.");
    }

    /** @inheritdoc */
    private async getWorkItemTrackingClient(): Promise<WorkItemTrackingApi> {
        const organizationUri = await this.devOpsService.getOrganizationUri();
        if (!organizationUri) {
            throw new Error("The configuration for Azure DevOps organization is not set.");
        }

        const personalAccessToken = await this.devOpsService.getPersonalAccessToken();
        if (!personalAccessToken) {
            throw new Error("Unable to access Azure DevOps without a personal access token configured.");
        }

        const authenticationHandler = devops.getPersonalAccessTokenHandler(personalAccessToken);
        const connection = new WebApi(organizationUri, authenticationHandler);
        return await connection.getWorkItemTrackingApi();
    }
}