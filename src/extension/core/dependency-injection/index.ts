/**
 * @fileoverview Main entry point for the dependency injection system.
 * Provides a lightweight, type-safe dependency injection container for TypeScript applications.
 *
 * @example
 * ```typescript
 * import { ServiceContainer } from './dependency-injection';
 *
 * // Configure services
 * ServiceContainer.configure(services => {
 *     services.addSingleton(ILogger, ConsoleLogger);
 *     services.addTransient(SampleCommand, (provider) => {
 *         const logger = provider.getRequiredService(ILogger);
 *         return new SampleCommand(logger);
 *     });
 * });
 *
 * // Resolve services
 * const command = ServiceContainer.resolve(SampleCommand);
 * command.execute();
 * ```
 */

// Core container and configuration
export * from './service-container';
export * from './service-token-registry';

// Type definitions
export * from './service-descriptor';
export * from './service-lifetime';
export * from './types';

// Interfaces
export * from './service-collection.interface';
export * from './service-provider.interface';
export * from './service-resolver.interface';
export * from './service-scope.interface';

// Implementation (usually not needed by consumers)
export * from './service-collection';
export * from './service-provider';
export * from './service-scope';

