/**
 * Defines members for mapping between two specified types.
 * @param T The type of the input to the map method.
 * @param U The type of the output from the map method.
 */
export interface Mapper<T, U> {
    /**
     * Maps the specified input to an output of the specified type.
     * @param input The input to map.
     * @returns The mapped output.
     */
    map(input: T): U;
}