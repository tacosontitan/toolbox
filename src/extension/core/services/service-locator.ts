import * as vscode from 'vscode';

// Constructor type for service resolution
type Constructor<T = any> = new (...args: any[]) => T;
type ServiceFactory<T> = () => T;
// Interface token type for abstraction-based resolution
type InterfaceToken<T = any> = Function & { prototype: T };
// String token for TypeScript interfaces that can't be used as runtime values
type StringToken = string;
// Combined service token type
type ServiceToken<T = any> = Constructor<T> | InterfaceToken<T> | StringToken;

/**
 * Service locator for managing singleton instances of services throughout the extension.
 * This helps eliminate dependency duplication and provides a central place for service creation.
 * Supports both concrete class registration and abstraction-based service resolution.
 *
 * Usage:
 * - ServiceLocator.getService(ILogger) // returns ILogger instance (abstraction)
 * - ServiceLocator.getService(OutputLogger) // returns OutputLogger instance (concrete)
 * - ServiceLocator.getService(DevOpsService) // returns DevOpsService instance
 */
export class ServiceLocator {
	private static context: vscode.ExtensionContext;
	private static services = new Map<ServiceToken<any>, any>();
	private static factories = new Map<ServiceToken<any>, ServiceFactory<any>>();

	/**
	 * Initializes the service locator with the extension context.
	 * This should be called once during extension activation.
	 */
	public static initialize(context: vscode.ExtensionContext): void {
		this.context = context;
		// Services will be registered explicitly in toolbox.registerServices()
	}

	/**
	 * Gets a service instance by its constructor/interface.
	 * @param serviceToken The constructor or interface token for the service
	 * @returns The singleton instance of the requested service
	 */
	public static getService<T>(serviceToken: ServiceToken<T>): T {
		// Check if we already have an instance cached
		if (this.services.has(serviceToken)) {
			return this.services.get(serviceToken);
		}

		// Check if we have a factory registered for this type
		const factory = this.factories.get(serviceToken);
		if (!factory) {
			const tokenName = typeof serviceToken === 'string' ? serviceToken : serviceToken.name;
			throw new Error(`No factory registered for service: ${tokenName}`);
		}

		// Create the instance using the factory
		const instance = factory();

		// Cache it for future use
		this.services.set(serviceToken, instance);

		return instance;
	}

	/**
	 * Registers a factory function for a service type.
	 * @param serviceToken The constructor or interface token
	 * @param factory The factory function that creates the service
	 */
	public static registerFactory<T>(serviceToken: ServiceToken<T>, factory: ServiceFactory<T>): void {
		this.factories.set(serviceToken, factory);
	}

	/**
	 * Registers a concrete implementation for an interface.
	 * This allows consumers to request services by their abstractions.
	 * @param interfaceToken The interface/abstract class token
	 * @param implementationToken The concrete implementation token
	 */
	public static registerInterface<TInterface, TImplementation extends TInterface>(
		interfaceToken: InterfaceToken<TInterface>,
		implementationToken: Constructor<TImplementation>
	): void {
		// Register the interface token to use the same factory as the implementation
		const implementationFactory = this.factories.get(implementationToken);
		if (!implementationFactory) {
			throw new Error(`Implementation factory must be registered before interface mapping: ${implementationToken.name}`);
		}
		
		this.factories.set(interfaceToken, implementationFactory);
	}

	/**
	 * Registers a concrete implementation for a TypeScript interface using a string token.
	 * This allows consumers to request services by their interface names.
	 * @param interfaceToken The string token for the interface
	 * @param implementationToken The concrete implementation token
	 */
	public static registerStringInterface<TImplementation>(
		interfaceToken: StringToken,
		implementationToken: Constructor<TImplementation>
	): void {
		// Register the string token to use the same factory as the implementation
		const implementationFactory = this.factories.get(implementationToken);
		if (!implementationFactory) {
			throw new Error(`Implementation factory must be registered before interface mapping: ${implementationToken.name}`);
		}
		
		this.factories.set(interfaceToken, implementationFactory);
	}

	/**
	 * Registers all the default service factories.
	 * NOTE: This is now handled explicitly in toolbox.registerServices()
	 */
	private static registerFactories(): void {
		// This method is kept for reference but not used
		// All registration is now done explicitly in toolbox.registerServices()
	}

	/**
	 * Clears all cached service instances. Useful for testing.
	 */
	public static clear(): void {
		this.services.clear();
	}

	/**
	 * Resets the service locator completely, clearing both instances and factories.
	 */
	public static reset(): void {
		this.services.clear();
		this.factories.clear();
		this.context = undefined as any;
	}
}
