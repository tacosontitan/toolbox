import { IWorkItemService, WorkItem } from "../../../core/workflow";

export class AzureDevOpsWorkItemService implements IWorkItemService {
    public async start(workItemId: number): Promise<WorkItem> {
        const workItem: WorkItem | null = await this.loadWorkItemDetails(workItemId);
        if (!workItem) {
            this.logger.log(LogLevel.Error, `Work item #${workItemId} not found. Exiting."`);
            return;
        }

        const confirm = await assistant.confirmUser(`Do you want to start work item #${workItemId} - ${workItem.title}?`);
        if (!confirm) {
            this.logger.log(LogLevel.Warning, "User declined to start the work item. Exiting.");
            return;
        }

        await this.changeWorkItemState(workItem, "Planning");
        return workItem;
    }
}