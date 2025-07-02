/**
 * @fileoverview Service descriptor for internal service registration tracking.
 * Defines how services are stored and managed within the DI container.
 */

import { ServiceLifetime } from "./service-lifetime";
import { Constructor, ServiceFactory } from "./types";

/**
 * Describes how a service is registered in the dependency injection container.
 * Contains all information needed to create instances of the service.
 * @template T The service type
 */
export interface ServiceDescriptor<T = any> {
    /**
     * Unique identifier for the service type.
     */
    serviceType: string;
    
    /**
     * Constructor function for creating the service instance.
     * Used when the service is registered with a constructor.
     */
    implementationType?: Constructor<T>;
    
    /**
     * Factory function for creating the service instance.
     * Used when the service is registered with a factory function.
     */
    implementationFactory?: ServiceFactory<T>;
    
    /**
     * Pre-created instance of the service.
     * Used when the service is registered with an existing instance.
     */
    implementationInstance?: T;
    
    /**
     * The lifetime management strategy for the service.
     */
    lifetime: ServiceLifetime;
}