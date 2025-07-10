import { window } from "vscode";
import { ICommunicationService } from "../../../core/communication";
import { IConfigurationProvider, ISecretProvider } from "../../../core/configuration";
import { ILogger, LogLevel } from "../../../core/telemetry";
import { IWorkItemService, WorkItem, WorkItemState, WorkItemType } from "../../../core/workflow";

export class AzureDevOpsWorkItemService implements IWorkItemService {
    private readonly organizationUri: string;

    constructor(
        private readonly secretProvider: ISecretProvider,
        private readonly configurationProvider: IConfigurationProvider,
        private readonly logger: ILogger,
        private readonly communicationService: ICommunicationService
    ) {

    }

    public async start(workItemId: number): Promise<WorkItem | null> {
        await this.loadPersonalAccessToken();
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
            window.showErrorMessage(`Failed to retrieve parent work item #${workItemId}: ${(error as Error).message}`);
            this.logger.log(LogLevel.Error, `Failed to retrieve parent work item #${workItemId}: ${(error as Error).message}`);
            return null;
        }
    }

    private async changeWorkItemState(workItem: WorkItem, state: WorkItemState): Promise<void> {

    }

    private async loadPersonalAccessToken(): Promise<string | null> {
        const organization = await this.configurationProvider.get<string>("azure.devops.organization");
        if (!organization) {
            window.showErrorMessage("Azure DevOps organization is not configured. Commands that require it will not work.");
            return null;
        }

        const useClassicUri = await this.configurationProvider.get<boolean>("azure.devops.useClassicUri");
        if (useClassicUri) {
            return `https://${organization}.visualstudio.com`;
        }

        return `https://dev.azure.com/${organization}`;
    }
}