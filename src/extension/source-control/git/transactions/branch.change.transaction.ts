import { GitTransaction } from "./git.transaction";

/**
 * Represents a transaction that switches to a different branch in the git repository.
 */
export class ChangeBranchTransaction extends GitTransaction {
    constructor(private readonly branchName: string) {
        super("Change Branch");
    }

    /** @inheritdoc */
    public async commit(): Promise<void> {
        await this.executeCommand(`git checkout ${this.branchName}`);
    }

    /** @inheritdoc */
    public async rollback(): Promise<void> {
        await this.executeCommand(`git checkout -`);
    }
}