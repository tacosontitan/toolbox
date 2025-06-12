import { IWorkItemService, TransactionalService, WorkItem } from "../../../workflow";

export class AzureDevOpsWorkItemService extends TransactionalService implements IWorkItemService {
    public start(workItemId: number): Promise<WorkItem> {
        return this.executeTransactions([
            // Define your transactions here
        ]);
    }
}