/**
 * @fileoverview Interface definitions for the service collection system.
 * Provides contracts for service registration and dependency management with full type safety.
 */

import { IServiceProvider } from "./service-provider.interface";
import { Constructor, ServiceType } from "./types";

/**
 * Interface for registering services with the dependency injection container.
 * Supports transient, singleton, and scoped service lifetimes with full type safety.
 */
export interface IServiceCollection {
    /**
     * Registers a transient service. A new instance is created each time the service is requested.
     * @template T The service type
     * @param serviceType The service type (class or abstract class) to register
     * @param implementation Optional implementation - constructor or factory function
     * @returns The service collection for method chaining
     */
    addTransient<T>(
        serviceType: ServiceType<T>,
        implementation?: Constructor<T> | ((provider: IServiceProvider) => T)
    ): IServiceCollection;

    /**
     * Registers a singleton service. Only one instance is created and shared across all requests.
     * @template T The service type
     * @param serviceType The service type (class or abstract class) to register
     * @param implementation Optional implementation - constructor, factory function, or instance
     * @returns The service collection for method chaining
     */
    addSingleton<T>(
        serviceType: ServiceType<T>,
        implementation?: Constructor<T> | ((provider: IServiceProvider) => T) | T
    ): IServiceCollection;

    /**
     * Registers a scoped service. One instance is created per scope (useful for request-scoped services).
     * @template T The service type
     * @param serviceType The service type (class or abstract class) to register
     * @param implementation Optional implementation - constructor or factory function
     * @returns The service collection for method chaining
     */
    addScoped<T>(
        serviceType: ServiceType<T>,
        implementation?: Constructor<T> | ((provider: IServiceProvider) => T)
    ): IServiceCollection;

    /**
     * Builds the service provider from the registered services.
     * Must be called after all services are registered.
     * @returns A service provider for resolving registered services
     */
    buildServiceProvider(): IServiceProvider;
}
