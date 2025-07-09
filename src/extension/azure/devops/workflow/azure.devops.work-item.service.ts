import { IWorkItemService, TransactionalService, WorkItem } from "../../../core/workflow";

export class AzureDevOpsWorkItemService extends TransactionalService implements IWorkItemService {
    public async start(workItemId: number): Promise<WorkItem> {
        await this.executeTransactions([
            // Define your transactions herenp
        ]);

        return new WorkItem("", "", 1, "");
    }
}