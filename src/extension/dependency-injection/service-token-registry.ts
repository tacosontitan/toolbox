/**
 * @fileoverview Service token registry for managing type-to-string mappings.
 * Provides a centralized way to map TypeScript types to string tokens without circular dependencies.
 */

/**
 * Internal registry for mapping TypeScript types to unique string tokens.
 * This allows the DI system to use TypeScript types as service identifiers while
 * maintaining compatibility with string-based service providers.
 */
export class ServiceTokenRegistry {
    private static _typeMap = new Map<any, string>();
    private static _typeCounter = 0;

    /**
     * Gets or creates a unique string token for the given service type.
     * This method is used internally by the DI system to map TypeScript types
     * to string identifiers for the underlying service provider.
     * 
     * @param serviceType The service type (class or abstract class)
     * @returns A unique string identifier for the type
     */
    static getTypeToken(serviceType: any): string {
        if (!ServiceTokenRegistry._typeMap.has(serviceType)) {
            ServiceTokenRegistry._typeMap.set(serviceType, `__type_${ServiceTokenRegistry._typeCounter++}`);
        }
        return ServiceTokenRegistry._typeMap.get(serviceType)!;
    }

    /**
     * Clears all registered type tokens.
     * This is typically called when reconfiguring the service container.
     */
    static clear(): void {
        ServiceTokenRegistry._typeMap.clear();
        ServiceTokenRegistry._typeCounter = 0;
    }

    /**
     * Gets the current number of registered types.
     * Useful for debugging and testing purposes.
     * 
     * @returns The number of registered service types
     */
    static getRegisteredTypeCount(): number {
        return ServiceTokenRegistry._typeMap.size;
    }
}
