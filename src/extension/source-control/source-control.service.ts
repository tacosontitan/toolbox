/**
 * Defines members for handling source control operations in the extension.
 */
export interface ISourceControlService {
    /**
     * Creates a new branch from the main branch and optionally stashes changes.
     *
     * @remarks
     * This method assumes that any pending changes should be stashed before switching
     * to the main branch and that those stashed changes should be reapplied after
     * creating the new branch. If there are no changes to stash, it will simply
     * create the branch from the main branch.
     *
     * @param branchName The name of the branch to create from main.
     * @param stashChanges Whether to stash changes before creating the branch.
     * @param applyStashAfterChange Whether to apply the stashed changes after creating the branch.
     * @returns A promise that resolves when the branch is created.
     */
    createBranchFromMain(branchName: string, stashChanges?: boolean, applyStashAfterChange?: boolean): Promise<void>;
}