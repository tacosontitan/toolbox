import { GitTransaction } from "./git.transaction";

/**
 * Represents a transaction that publishes a branch to the remote repository.
 */
export class PublishBranchTransaction extends GitTransaction {
    constructor(private readonly branchName: string) {
        super();
    }

    /** @inheritdoc */
    public async commit(): Promise<void> {
        await this.executeCommand(`git push -u origin ${this.branchName}`);
    }

    /** @inheritdoc */
    public async rollback(): Promise<void> {
        await this.executeCommand(`git push origin --delete ${this.branchName}`);
    }
}