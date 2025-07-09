import { GitTransaction } from "./git.transaction";

/**
 * Represents a transaction that creates a new branch in the git repository.
 */
export class CreateBranchTransaction
    extends GitTransaction {

    /**
     * Creates a new instance of the create branch transaction.
     * @param branchName The name of the branch to create.
     */
    constructor(private readonly branchName: string) {
        super("Create Branch");
    }

    /** @inheritdoc */
    public async commit(): Promise<void> {
        await this.executeCommand(`git checkout -b ${this.branchName}`);
    }

    /** @inheritdoc */
    public async rollback(): Promise<void> {
        await this.executeCommand(`git branch -d ${this.branchName}`);
    }
}