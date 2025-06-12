import { exec } from 'child_process';
import { ITransaction } from "../../../workflow/transaction";

/**
 * Represents a transaction that executes git commands in the terminal.
 */
export abstract class GitTransaction
    implements ITransaction {

    /** @inheritdoc */
    public abstract commit(): Promise<void>;

    /** @inheritdoc */
    public abstract rollback(): Promise<void>;

    /**
     * Executes a git command in the terminal.
     * @param command The git command to execute.
     * @returns A promise that resolves when the command is executed successfully, or rejects with an error if the command fails.
     */
    protected executeCommand(command: string): Promise<void> {
        return new Promise((resolve, reject) => {
            exec(command, (error: any, stdout: string, stderr: string) => {
                if (error) {
                    reject(new Error(stderr || error.message));
                } else {
                    resolve();
                }
            });
        });
    }
}