/**
 * @fileoverview Core type definitions for the dependency injection system.
 * Provides type-safe constructor and service type definitions.
 */

/**
 * Represents a constructor function that can create instances of type T.
 * @template T The type that the constructor creates
 */
export type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Represents an abstract constructor function for type T.
 * Used for abstract classes that cannot be instantiated directly.
 * @template T The type that the abstract constructor represents
 */
export type AbstractConstructor<T = {}> = abstract new (...args: any[]) => T;

/**
 * Union type representing either a concrete or abstract constructor.
 * This is used as a service identifier in the DI container.
 * @template T The service type
 */
export type ServiceType<T = any> = Constructor<T> | AbstractConstructor<T>;

/**
 * Factory function type for creating service instances.
 * @template T The service type to create
 */
export type ServiceFactory<T> = (provider: any) => T;