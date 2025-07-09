import { Transaction } from "../../../../core/workflow";

export class UpdateWorkItemTransaction extends Transaction {
    commit(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    rollback(): Promise<void> {
        throw new Error("Method not implemented.");
    }

}