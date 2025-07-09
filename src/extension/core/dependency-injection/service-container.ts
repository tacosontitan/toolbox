/**
 * @fileoverview Main service container for dependency injection.
 * Provides a static API for configuring and resolving services with type safety.
 */

import { ServiceCollection } from './service-collection';
import { IServiceCollection } from './service-collection.interface';
import { IServiceProvider } from './service-provider.interface';
import { ServiceTokenRegistry } from './service-token-registry';
import { ServiceType } from './types';

/**
 * Static service container providing dependency injection capabilities.
 * Supports type-safe service registration and resolution using TypeScript types.
 *
 * @example
 * ```typescript
 * // Configure services
 * ServiceContainer.configure(services => {
 *     services.addSingleton(ILogger, () => new ConsoleLogger());
 *     services.addTransient(IDataService, DataService);
 * });
 *
 * // Resolve services
 * const logger = ServiceContainer.resolve(ILogger);
 * const dataService = ServiceContainer.getRequiredService(IDataService);
 * ```
 */
export class ServiceContainer {
    private static _serviceProvider: IServiceProvider | undefined;
    private static _serviceCollection: ServiceCollection = new ServiceCollection();

    /**
     * Configures the service container with service registrations.
     * Must be called before any services can be resolved.
     *
     * @param configureServices Function that receives a TypedServiceCollection for registration
     *
     * @example
     * ```typescript
     * ServiceContainer.configure(services => {
     *     services.addSingleton(ILogger, ConsoleLogger);
     *     services.addTransient(SampleCommand, (provider) => {
     *         const logger = provider.getRequiredService(ILogger);
     *         return new SampleCommand(logger);
     *     });
     * });
     * ```
     */
    static configure(configureServices: (services: IServiceCollection) => void): void {
        ServiceContainer._serviceCollection = new ServiceCollection();
        ServiceTokenRegistry.clear();

        configureServices(ServiceContainer._serviceCollection);
        ServiceContainer._serviceProvider = ServiceContainer._serviceCollection.buildServiceProvider();
    }

    /**
     * Gets a service of the specified type.
     * Returns undefined if the service is not registered.
     *
     * @template T The service type
     * @param serviceType The service type (class or abstract class)
     * @returns The service instance or undefined if not found
     *
     * @example
     * ```typescript
     * const logger = ServiceContainer.getService(ILogger);
     * if (logger) {
     *     logger.log('Service found');
     * }
     * ```
     */
    static getService<T>(serviceType: ServiceType<T>): T | undefined {
        if (!ServiceContainer._serviceProvider) {
            throw new Error('Services not configured. Call ServiceContainer.configure() first.');
        }
        return ServiceContainer._serviceProvider.getService<T>(serviceType);
    }

    /**
     * Gets a required service of the specified type.
     * Throws an error if the service is not registered.
     *
     * @template T The service type
     * @param serviceType The service type (class or abstract class)
     * @returns The service instance
     * @throws Error if the service is not registered
     *
     * @example
     * ```typescript
     * const logger = ServiceContainer.getRequiredService(ILogger);
     * logger.log('Service found'); // Safe to use without null check
     * ```
     */
    static getRequiredService<T>(serviceType: ServiceType<T>): T {
        if (!ServiceContainer._serviceProvider) {
            throw new Error('Services not configured. Call ServiceContainer.configure() first.');
        }
        return ServiceContainer._serviceProvider.getRequiredService<T>(serviceType);
    }

    /**
     * Creates a new service scope for scoped service lifetime management.
     * Services registered as scoped will have one instance per scope.
     *
     * @returns A new service scope that should be disposed when no longer needed
     *
     * @example
     * ```typescript
     * const scope = ServiceContainer.createScope();
     * try {
     *     const scopedService = scope.getRequiredService(IScopedService);
     *     // Use scoped service
     * } finally {
     *     scope.dispose(); // Clean up scoped services
     * }
     * ```
     */
    static createScope() {
        if (!ServiceContainer._serviceProvider) {
            throw new Error('Services not configured. Call ServiceContainer.configure() first.');
        }
        return ServiceContainer._serviceProvider.createScope();
    }



    /**
     * Resolves a service of the specified type.
     * Alias for getRequiredService with a shorter name.
     *
     * @template T The service type
     * @param serviceType The service type (class or abstract class)
     * @returns The service instance
     * @throws Error if the service is not registered
     *
     * @example
     * ```typescript
     * const command = ServiceContainer.resolve(SampleCommand);
     * command.execute();
     * ```
     */
    static resolve<T>(serviceType: ServiceType<T>): T {
        return ServiceContainer.getRequiredService(serviceType);
    }

    /**
     * Alternative syntax for resolving services with explicit generic type.
     * Provides the same functionality as resolve() but with generic syntax.
     *
     * @template T The service type
     * @param serviceType The service type (class or abstract class)
     * @returns The service instance
     * @throws Error if the service is not registered
     *
     * @example
     * ```typescript
     * const command = ServiceContainer.get<SampleCommand>(SampleCommand);
     * ```
     */
    static get<T>(serviceType: ServiceType<T>): T {
        return ServiceContainer.resolve(serviceType);
    }



    /**
     * Gets the configured service provider instance.
     * This is useful when you need to pass the service provider to other systems
     * that manage their own service resolution.
     *
     * @returns The configured service provider
     * @throws Error if services are not configured
     *
     * @example
     * ```typescript
     * const provider = ServiceContainer.getServiceProvider();
     * const command = new SomeCommand(provider); // Service locator pattern
     * ```
     */
    static getServiceProvider(): IServiceProvider {
        if (!ServiceContainer._serviceProvider) {
            throw new Error('Services not configured. Call ServiceContainer.configure() first.');
        }
        return ServiceContainer._serviceProvider;
    }
}
