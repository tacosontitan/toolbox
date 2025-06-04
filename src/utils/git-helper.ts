import { exec } from 'child_process';

export class GitHelper {
    private executeCommand(command: string): Promise<void> {
        return new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(stderr || error.message));
                } else {
                    resolve();
                }
            });
        });
    }

    public async checkoutBranch(branchName: string): Promise<void> {
        await this.executeCommand(`git checkout ${branchName}`);
    }

    public async pullLatestChanges(): Promise<void> {
        await this.executeCommand('git pull');
    }

    public async stashChanges(): Promise<void> {
        await this.executeCommand('git stash');
    }

    public async popStashedChanges(): Promise<void> {
        await this.executeCommand('git stash pop');
    }

    public async createBranch(branchName: string): Promise<void> {
        await this.executeCommand(`git checkout -b ${branchName}`);
    }

    public async publishBranch(branchName: string): Promise<void> {
        await this.executeCommand(`git push -u origin ${branchName}`);
    }
}
