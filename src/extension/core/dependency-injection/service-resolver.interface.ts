/**
 * @fileoverview Base service resolver interface.
 * Provides the core service resolution contract without scope management.
 */

import { ServiceType } from "./types";

/**
 * Base interface for resolving services from the dependency injection container.
 * Provides the core methods for service resolution without scope management.
 */
export interface IServiceResolver {
    /**
     * Gets a service of the specified type.
     * Returns undefined if the service is not registered.
     * @template T The service type
     * @param serviceType The service type (class or abstract class)
     * @returns The service instance or undefined if not found
     */
    getService<T>(serviceType: ServiceType<T>): T | undefined;
    
    /**
     * Gets a required service of the specified type.
     * Throws an error if the service is not registered.
     * @template T The service type
     * @param serviceType The service type (class or abstract class)
     * @returns The service instance
     * @throws Error if the service is not registered
     */
    getRequiredService<T>(serviceType: ServiceType<T>): T;
}
