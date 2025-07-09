/**
 * Defines members for creating and querying configuration values within the extension.
 */
export abstract class IConfigurationProvider {
    /**
     * Retrieves a configuration value by its key.
     * @param key The key to use for retrieving the configuration value.
     * @returns A promise that resolves to the configuration value, or undefined if not found.
     */
    public abstract get<T>(key: string): Promise<T | undefined>;

    /**
     * Sets a configuration value by its key.
     * @param key The key to use for storing the configuration value.
     * @param value The value to store in the configuration.
     * @returns A promise that resolves when the operation is complete.
     */
    public abstract set<T>(key: string, value: T): Promise<void>;
}