import { GitTransaction } from "./git.transaction";

/**
 * Represents a transaction that stashes changes in the git repository.
 */
export class StashTransaction extends GitTransaction {
    constructor() {
        super("Stash Changes");
    }

    /** @inheritdoc */
    public async commit(): Promise<void> {
        await this.executeCommand(`git stash`);
    }

    /** @inheritdoc */
    public async rollback(): Promise<void> {
        await this.executeCommand(`git stash pop`);
    }
}