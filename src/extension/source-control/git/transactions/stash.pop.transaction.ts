import { GitTransaction } from "./git.transaction";

/**
 * Represents a transaction that pops stashed changes in the git repository.
 */
export class PopStashTransaction extends GitTransaction {
    /** @inheritdoc */
    public async commit(): Promise<void> {
        await this.executeCommand(`git stash pop`);
    }

    /** @inheritdoc */
    public rollback(): Promise<void> {
        return Promise.resolve();
    }
}