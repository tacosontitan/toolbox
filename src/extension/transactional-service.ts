import { ITransaction } from "./transaction";

export abstract class TransactionalService {
    protected executeTransactions(transactions: ITransaction[]): Promise<void> {
        return new Promise(async (resolve, reject) => {
            let completedTransactions: ITransaction[] = [];
            try {
                for (const transaction of transactions) {
                    await transaction.commit();
                    completedTransactions.push(transaction);
                }
                resolve();
            } catch (error) {
                const transactionsToRollback = completedTransactions.reverse();
                for (const completedTransaction of transactionsToRollback) {
                    await completedTransaction.rollback();
                }
                reject(new Error(`Transaction failed: ${(error as Error).message}`));
            }
        });
    }
}