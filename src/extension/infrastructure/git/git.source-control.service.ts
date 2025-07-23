import { exec } from 'child_process';
import { ISourceControlService } from "../../core/source-control/source-control.service";

/**
 * Represents a service for managing git operations in a repository.
 *
 * @remarks
 * This service provides methods to create branches, manage stashes,
 * and perform other git-related operations by executing git commands directly.
 */
export class GitService implements ISourceControlService {

    /** @inheritdoc */
    public async createBranchFromMain(
        branchName: string,
        stashChanges: boolean = true,
        applyStashAfterChange: boolean = true): Promise<void> {

        try {
            // Stash changes if requested
            if (stashChanges) {
                await this.stashChanges();
            }

            // Switch to main branch
            await this.changeBranch("main");

            // Pull latest changes
            await this.pullChanges();

            // Create and switch to new branch
            await this.createBranch(branchName);

            // Publish the branch to remote
            await this.publishBranch(branchName);

            // Apply stashed changes if requested
            if (applyStashAfterChange) {
                await this.popStash();
            }
        } catch (error) {
            throw new Error(`Failed to create branch from main: ${(error as Error).message}`);
        }
    }

    /**
     * Executes a git command in the terminal.
     * @param command The git command to execute.
     * @returns A promise that resolves when the command is executed successfully, or rejects with an error if the command fails.
     */
    private executeCommand(command: string): Promise<void> {
        return new Promise((resolve, reject) => {
            exec(command, (error: any, _stdout: string, stderr: string) => {
                if (error) {
                    reject(new Error(stderr || error.message));
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Stashes current changes in the repository.
     */
    private async stashChanges(): Promise<void> {
        await this.executeCommand('git stash');
    }

    /**
     * Pops the most recent stash.
     */
    private async popStash(): Promise<void> {
        await this.executeCommand('git stash pop');
    }

    /**
     * Changes to the specified branch.
     * @param branchName The name of the branch to switch to.
     */
    private async changeBranch(branchName: string): Promise<void> {
        await this.executeCommand(`git checkout ${branchName}`);
    }

    /**
     * Pulls the latest changes from the remote repository.
     */
    private async pullChanges(): Promise<void> {
        await this.executeCommand('git pull');
    }

    /**
     * Creates a new branch and switches to it.
     * @param branchName The name of the branch to create.
     */
    private async createBranch(branchName: string): Promise<void> {
        await this.executeCommand(`git checkout -b ${branchName}`);
    }

    /**
     * Publishes a branch to the remote repository.
     * @param branchName The name of the branch to publish.
     */
    private async publishBranch(branchName: string): Promise<void> {
        await this.executeCommand(`git push -u origin ${branchName}`);
    }
}