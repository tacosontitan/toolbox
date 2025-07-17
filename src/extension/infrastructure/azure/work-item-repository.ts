import * as devops from "azure-devops-node-api";
import { WebApi } from "azure-devops-node-api";
import { WorkItemTrackingApi } from "azure-devops-node-api/WorkItemTrackingApi";
import { IConfiguration, ILogger, LogLevel } from "../../core";
import { IRepository } from "../../core/repository";
import { WorkItem } from "../../domain/workflow";
import { DevOpsOptions } from "./devops.options";
import { WorkItemMapper } from "./mappings/work-item.mapper";

/** @inheritdoc */
export class AzureDevOpsWorkItemRepository implements IRepository<WorkItem> {

    /**
     * @constructor
     * @param configuration The configuration for DevOps options.
     * @param workItemMapper The mapper to convert between domain and infrastructure models.
     */
    constructor(
        private readonly logger: ILogger,
        private readonly configuration: IConfiguration<DevOpsOptions>,
        private readonly workItemMapper: WorkItemMapper
    ) { }

    /** @inheritdoc */
    async getById(id: number): Promise<WorkItem | undefined>
    {
        this.logger.log(LogLevel.Trace, `Retrieving work item ${id} from Azure DevOps.`);
        const workItemTrackingClient = await this.getWorkItemTrackingClient();
        const workItem = await workItemTrackingClient.getWorkItem(id);
        return this.workItemMapper.mapInfrastructureModelToDomainModel(workItem);
    }

    /** @inheritdoc */
    async create(item: WorkItem): Promise<WorkItem> {
        this.logger.log(LogLevel.Trace, `Creating work item ${item.title} in Azure DevOps.`);
        const workItemTrackingClient = await this.getWorkItemTrackingClient();
        const patchDocument = this.workItemMapper.mapDomainModelToJsonPatchDocument(item);
        const options: DevOpsOptions = await this.configuration.get();
        const response = await workItemTrackingClient.createWorkItem([], patchDocument, options.organization, item.type.name);
        return this.workItemMapper.mapInfrastructureModelToDomainModel(response);
    }

    /** @inheritdoc */
    async update(item: WorkItem): Promise<WorkItem> {
        this.logger.log(LogLevel.Trace, `Updating work item ${item.title} in Azure DevOps.`);
        const workItemTrackingClient = await this.getWorkItemTrackingClient();
        const patchDocument = this.workItemMapper.mapDomainModelToJsonPatchDocument(item);
        const options: DevOpsOptions = await this.configuration.get();
        const workItemNumber: number = item.id || 0;
        const response = await workItemTrackingClient.updateWorkItem([], patchDocument, workItemNumber, options.organization);
        return this.workItemMapper.mapInfrastructureModelToDomainModel(response);
    }

    /** @inheritdoc */
    async delete(id: number): Promise<void> {
        this.logger.log(LogLevel.Trace, `Deleting work item with ID ${id} in Azure DevOps.`);
        const workItemTrackingClient = await this.getWorkItemTrackingClient();
        const options: DevOpsOptions = await this.configuration.get();
        const _ = await workItemTrackingClient.deleteWorkItem(id, options.organization);
    }

    /** @inheritdoc */
    private async getWorkItemTrackingClient(): Promise<WorkItemTrackingApi> {
        const options: DevOpsOptions = await this.configuration.get();
        const authenticationHandler = devops.getPersonalAccessTokenHandler(options.personalAccessToken);
        const connection = new WebApi(options.organization, authenticationHandler);
        return await connection.getWorkItemTrackingApi();
    }
}