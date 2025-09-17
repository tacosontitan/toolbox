/**
 * Defines members for handling communication with the user in the extension.
 */
export abstract class ICommunicationService {
    /**
     * Sends a message to the user and waits for a response.
     * @param message The message to send to the user.
     * @returns A promise that resolves to the user's response.
     */
    abstract prompt<TResult>(message: string): Promise<TResult>;

    /**
     * Displays a confirmation dialog to the user.
     * @param message The message to display in the confirmation dialog.
     * @returns A promise that resolves to true if the user confirms, or false if they cancel.
     */
    abstract confirm(message: string): Promise<boolean>;
}