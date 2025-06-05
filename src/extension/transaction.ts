/**
 * Defines members for handling transactions in the extension.
 */
export interface ITransaction {
    /**
     * Commits the transaction.
     * @return A promise that resolves when the transaction is complete.
     */
    commit(): Promise<void>;

    /**
     * Rolls back the transaction.
     * @return A promise that resolves when the transaction is rolled back.
     */
    rollback(): Promise<void>;
}