/**
 * @fileoverview Service lifetime enumeration for dependency injection.
 * Defines the available service lifetimes in the DI container.
 */

/**
 * Enumeration of service lifetimes supported by the dependency injection container.
 */
export enum ServiceLifetime {
    /**
     * Transient lifetime - a new instance is created each time the service is requested.
     * Use for lightweight, stateless services.
     */
    Transient = 'transient',
    
    /**
     * Singleton lifetime - only one instance is created and reused for the entire application.
     * Use for expensive-to-create or stateful services that should be shared.
     */
    Singleton = 'singleton',
    
    /**
     * Scoped lifetime - one instance is created per scope (useful for request-scoped services).
     * Use for services that should be shared within a specific operation or request.
     */
    Scoped = 'scoped'
}