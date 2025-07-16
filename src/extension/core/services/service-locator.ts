import * as vscode from 'vscode';
import { DevOpsService } from '../../services/devops-service';
import { WorkItemService } from '../../services/work-item.service';
import { TimeEntryService } from '../../time';
import { NativeCommunicationService } from '../communication';
import { NativeConfigurationProvider, NativeSecretProvider } from '../configuration';
import { ConfigurationManager } from '../configuration/configuration-manager';
import { GitService } from '../source-control/git.service';
import { OutputLogger } from '../telemetry';

// Constructor type for service resolution
type Constructor<T = any> = new (...args: any[]) => T;
type ServiceFactory<T> = () => T;

/**
 * Service locator for managing singleton instances of services throughout the extension.
 * This helps eliminate dependency duplication and provides a central place for service creation.
 *
 * Usage:
 * - ServiceLocator.getService(OutputLogger) // returns ILogger instance
 * - ServiceLocator.getService(DevOpsService) // returns DevOpsService instance
 */
export class ServiceLocator {
	private static context: vscode.ExtensionContext;
	private static services = new Map<Constructor<any>, any>();
	private static factories = new Map<Constructor<any>, ServiceFactory<any>>();

	/**
	 * Initializes the service locator with the extension context.
	 * This should be called once during extension activation.
	 */
	public static initialize(context: vscode.ExtensionContext): void {
		this.context = context;
		this.registerFactories();
	}

	/**
	 * Gets a service instance by its constructor/interface.
	 * @param serviceType The constructor or interface token for the service
	 * @returns The singleton instance of the requested service
	 */
	public static getService<T>(serviceType: Constructor<T>): T {
		// Check if we already have an instance cached
		if (this.services.has(serviceType)) {
			return this.services.get(serviceType);
		}

		// Check if we have a factory registered for this type
		const factory = this.factories.get(serviceType);
		if (!factory) {
			throw new Error(`No factory registered for service: ${serviceType.name}`);
		}

		// Create the instance using the factory
		const instance = factory();

		// Cache it for future use
		this.services.set(serviceType, instance);

		return instance;
	}

	/**
	 * Registers a factory function for a service type.
	 * @param serviceType The constructor or interface token
	 * @param factory The factory function that creates the service
	 */
	public static registerFactory<T>(serviceType: Constructor<T>, factory: ServiceFactory<T>): void {
		this.factories.set(serviceType, factory);
	}

	/**
	 * Registers all the default service factories.
	 */
	private static registerFactories(): void {
		// Register core services that don't depend on others
		this.registerFactory(OutputLogger, () => new OutputLogger("Hazel's Toolbox"));

		this.registerFactory(NativeSecretProvider, () => {
			if (!this.context) {
				throw new Error('ServiceLocator must be initialized before use');
			}
			return new NativeSecretProvider(this.context);
		});

		this.registerFactory(NativeConfigurationProvider, () => new NativeConfigurationProvider());
		this.registerFactory(NativeCommunicationService, () => new NativeCommunicationService());
		this.registerFactory(GitService, () => new GitService());

		// Register configuration manager
		this.registerFactory(ConfigurationManager, () => new ConfigurationManager(
			this.getService(NativeConfigurationProvider),
			this.getService(NativeSecretProvider),
			this.getService(OutputLogger)
		));

		// Register services with dependencies
		this.registerFactory(DevOpsService, () => new DevOpsService(
			this.getService(NativeSecretProvider),
			this.getService(NativeConfigurationProvider)
		));

		this.registerFactory(WorkItemService, () => new WorkItemService(
			this.getService(OutputLogger),
			this.getService(NativeCommunicationService),
			this.getService(DevOpsService)
		));

		this.registerFactory(TimeEntryService, () => {
			if (!this.context) {
				throw new Error('ServiceLocator must be initialized before use');
			}
			return new TimeEntryService(this.context);
		});
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
