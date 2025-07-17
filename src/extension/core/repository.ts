/**
 * Defines members for repository operations.
 */
export interface IRepository<T> {
    /**
     * Gets all items from the repository.
     * @returns A promise that resolves to an array of items.
     */
    get(): Promise<T[]>;

    /**
     * Gets an item by its ID.
     * @param id The ID of the item to retrieve.
     * @returns A promise that resolves to the item if found, or undefined if not found.
     */
    get(id: number): Promise<T | undefined>;

    /**
     * Creates a new item in the repository.
     * @param item The item to create.
     * @returns A promise that resolves to the created item.
     */
    create(item: T): Promise<T>;

    /**
     * Updates an existing item in the repository.
     * @param item The item to update.
     * @returns A promise that resolves to the updated item.
     */
    update(item: T): Promise<T>;

    /**
     * Deletes an item from the repository by its ID.
     * @param id The ID of the item to delete.
     * @returns A promise that resolves when the item has been deleted.
     */
    delete(id: number): Promise<void>;
}