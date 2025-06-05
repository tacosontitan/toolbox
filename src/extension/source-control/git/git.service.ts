import { TransactionalService } from "../../transactional-service";
import { ISourceControlService } from "../source-control.service";
import { ChangeBranchTransaction } from "./transactions/branch.change.transaction";
import { CreateBranchTransaction } from "./transactions/branch.create.transaction";
import { PublishBranchTransaction } from "./transactions/branch.publish.transaction";
import { PullTransaction } from "./transactions/pull.transaction";
import { PopStashTransaction } from "./transactions/stash.pop.transaction";
import { StashTransaction } from "./transactions/stash.transaction";

/**
 * Represents a service for managing git operations in a repository.
 *
 * @remarks
 * This service provides methods to create branches, manage stashes,
 * and perform other git-related operations by executing a series of
 * transactions. It extends the `TransactionalService` to ensure that
 * operations can be committed or rolled back as needed.
 */
export class GitService
    extends TransactionalService
    implements ISourceControlService {

    /** @inheritdoc */
    public async createBranchFromMain(
        branchName: string,
        stashChanges: boolean = true,
        applyStashAfterChange: boolean = true): Promise<void> {
        let transactions = [
            new ChangeBranchTransaction("main"),
            new PullTransaction(),
            new CreateBranchTransaction(branchName),
            new PublishBranchTransaction(branchName)
        ];

        if (stashChanges)
        {
            transactions.unshift(new StashTransaction());
        }

        if (applyStashAfterChange)
        {
            transactions.push(new PopStashTransaction());
        }

        await this.executeTransactions(transactions);
    }
}