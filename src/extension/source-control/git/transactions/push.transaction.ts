import { GitTransaction } from "./git.transaction";

/**
 * Represents a transaction that pushes changes to the remote repository.
 */
export class PushTransaction extends GitTransaction {
    constructor() {
        super("Push Changes");
    }

    /** @inheritdoc */
    public async commit(): Promise<void> {
        await this.executeCommand(`git push`);
    }

    /** @inheritdoc */
    public rollback(): Promise<void> {
        return Promise.resolve();
    }
}