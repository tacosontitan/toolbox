import { UUID } from "crypto";
import { IAssistant } from "../assistant";

/**
 * Defines members for handling transactions in the extension.
 */
export abstract class Transaction {
    /**
     * Unique identifier for the transaction.
     */
    public id: UUID;

    /**
     * The display name for the transaction.
     */
    public displayName: string;

    constructor(displayName: string) {
        this.id = crypto.randomUUID() as UUID;
        this.displayName = displayName;
    }

    /**
     * Commits the transaction.
     * @return A promise that resolves when the transaction is complete.
     */
    abstract commit(assistant: IAssistant): Promise<void>;

    /**
     * Rolls back the transaction.
     * @return A promise that resolves when the transaction is rolled back.
     */
    abstract rollback(assistant: IAssistant): Promise<void>;
}