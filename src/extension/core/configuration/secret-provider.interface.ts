/**
 * Defines members for creating and querying secrets within the extension.
 */
export abstract class ISecretProvider {
    /**
     * Retrieves a secret value by its key.
     * @param key The key to use for storing the secret.
     * @returns A promise that resolves to the secret value, or undefined if not found.
     */
    public abstract get<T>(key: string): Promise<T | undefined>;

    /**
     * Stores a secret value by its key.
     * @param key The key to use for storing the secret.
     * @param value The value to store as a secret.
     * @returns A promise that resolves to true if the secret exists, false otherwise.
     */
    public abstract set<T>(key: string, value: T): Promise<void>;
}
