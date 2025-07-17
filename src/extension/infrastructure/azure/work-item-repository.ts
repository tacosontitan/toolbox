import * as devops from "azure-devops-node-api";
import { WebApi } from "azure-devops-node-api";
import { WorkItemTrackingApi } from "azure-devops-node-api/WorkItemTrackingApi";
import { IRepository } from "../../core/repository";
import { WorkItem } from "../../domain/workflow";
import { DevOpsService } from "./devops-service";
import { WorkItemMapper } from "./mappings/work-item.mapper";

/** @inheritdoc */
export class AzureDevOpsWorkItemRepository implements IRepository<WorkItem> {
    constructor(
        private readonly devOpsService: DevOpsService,
        private readonly workItemMapper: WorkItemMapper
    ) { }

    /** @inheritdoc */
    async getById(id: number): Promise<WorkItem | undefined>
    {
        const workItemTrackingClient = await this.getWorkItemTrackingClient();
        const workItem = await workItemTrackingClient.getWorkItem(id);
        return this.workItemMapper.map(workItem);
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