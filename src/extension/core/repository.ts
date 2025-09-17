/**
 * Defines members for repository operations.
 */
export abstract class IRepository<T> {
    /**
     * Gets an item by its ID.
     * @param id The ID of the item to retrieve.
     * @returns A promise that resolves to the item if found, or undefined if not found.
     */
    abstract getById(id: number): Promise<T | undefined>;

    /**
     * Creates a new item in the repository.
     * @param item The item to create.
     * @returns A promise that resolves to the created item.
     */
    abstract create(item: T): Promise<T>;

    /**
     * Updates an existing item in the repository.
     * @param item The item to update.
     * @returns A promise that resolves to the updated item.
     */
    abstract update(item: T): Promise<T>;

    /**
     * Deletes an item from the repository by its ID.
     * @param id The ID of the item to delete.
     * @returns A promise that resolves when the item has been deleted.
     */
    abstract delete(id: number): Promise<void>;
}