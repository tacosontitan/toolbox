import { GitTransaction } from "./git.transaction";

/**
 * Represents a transaction that pulls the latest changes from the remote repository.
 */
export class PullTransaction extends GitTransaction {
    constructor() {
        super("Pull Changes");
    }

    /** @inheritdoc */
    public async commit(): Promise<void> {
        await this.executeCommand(`git pull`);
    }

    /** @inheritdoc */
    public rollback(): Promise<void> {
        return Promise.resolve();
    }
}