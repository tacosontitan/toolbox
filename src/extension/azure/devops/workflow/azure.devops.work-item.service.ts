import * as devops from "azure-devops-node-api";
import { window } from "vscode";

import { WebApi } from 'azure-devops-node-api/WebApi';
import { WorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';

import { ICommunicationService } from "../../../core/communication";
import { IConfigurationProvider, ISecretProvider } from "../../../core/configuration";
import { ILogger, LogLevel } from "../../../core/telemetry";
import { IWorkItemService, WorkItem, WorkItemState, WorkItemType } from "../../../core/workflow";
import { DevOpsService } from "../devops-service";

export class AzureDevOpsWorkItemService implements IWorkItemService {
    constructor(
        private readonly secretProvider: ISecretProvider,
        private readonly configurationProvider: IConfigurationProvider,
        private readonly logger: ILogger,
        private readonly communicationService: ICommunicationService,
        private readonly devOpsService: DevOpsService
    ) {

    }

    public async start(workItemId: number): Promise<WorkItem | null> {
        const workItem: WorkItem | null = await this.getWorkItem(workItemId);
        if (!workItem) {
            this.logger.log(LogLevel.Error, `Work item #${workItemId} not found. Exiting."`);
            return null;
        }

        const confirmationMessage = `Do you want to start work item #${workItemId} - ${workItem.title}?`;
        const confirm = await this.communicationService.confirm(confirmationMessage);
        if (!confirm) {
            this.logger.log(LogLevel.Warning, "User declined to start the work item. Exiting.");
            return null;
        }

        await this.changeWorkItemState(workItem, WorkItemState.Planning);
        return workItem;
    }

    public async getWorkItem(workItemId: number): Promise<WorkItem | null> {
        try {
            const organizationUri = await this.devOpsService.getOrganizationUri();
            if (!organizationUri) {
                window.showErrorMessage("Unable to query work item details without an Azure DevOps organization configured.");
                this.logger.log(LogLevel.Error, "Unable to query work item details without an Azure DevOps organization configured.");
                return null;
            }

            const personalAccessToken = await this.devOpsService.getPersonalAccessToken();
            if (!personalAccessToken) {
                window.showErrorMessage("Unable to query work item details without a personal access token configured.");
                this.logger.log(LogLevel.Error, "Unable to query work item details without a personal access token configured.");
                return null;
            }

            const authenticationHandler = devops.getPersonalAccessTokenHandler(personalAccessToken);
            const connection = new WebApi(organizationUri, authenticationHandler);
            const workItemTrackingClient: WorkItemTrackingApi = await connection.getWorkItemTrackingApi();
            const parentWorkItem = await workItemTrackingClient.getWorkItem(workItemId);
            const workItemTitle = parentWorkItem.fields?.['System.Title'] as string;
            return {
                id: workItemId,
                title: workItemTitle,
                type: new WorkItemType(parentWorkItem.fields?.['System.WorkItemType'] as string),
                state: new WorkItemState(parentWorkItem.fields?.['System.State'] as string),
                areaPath: parentWorkItem.fields?.['System.AreaPath'] as string,
                iterationPath: parentWorkItem.fields?.['System.IterationPath'] as string,
                description: parentWorkItem.fields?.['System.Description'] as string || "",
                remainingWork: parentWorkItem.fields?.['Microsoft.VSTS.Scheduling.RemainingWork'] as number || 0,
                activity: parentWorkItem.fields?.['Microsoft.VSTS.Common.Activity'] as string || "",
                additionalFields: parentWorkItem.fields || {}
            };
        } catch (error) {
            window.showErrorMessage(`Failed to retrieve work item #${workItemId}: ${(error as Error).message}`);
            this.logger.log(LogLevel.Error, `Failed to retrieve work item #${workItemId}: ${(error as Error).message}`);
            return null;
        }
    }

    public async changeWorkItemState(workItem: WorkItem, state: WorkItemState): Promise<void> {

    }
}