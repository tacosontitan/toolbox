import { ConfigurationError } from './configuration-errors';
import { ConfigurationManager } from './configuration-manager';

/**
 * Decorator that ensures Azure DevOps configuration is valid before executing the method.
 * Automatically handles configuration validation and error display.
 */
export function RequiresAzureDevOpsConfig(target: any, propertyName: string, descriptor: PropertyDescriptor) {
	const originalMethod = descriptor.value;
	
	descriptor.value = async function (...args: any[]) {
		const configManager = getConfigurationManager(this);
		
		try {
			// Validate configuration before method execution
			await configManager.getAzureDevOpsConfiguration();
			
			// Configuration is valid, proceed with original method
			return await originalMethod.apply(this, args);
			
		} catch (error) {
			if (error instanceof ConfigurationError) {
				// Configuration error was already handled by ConfigurationManager
				return;
			}
			// Re-throw non-configuration errors
			throw error;
		}
	};
	
	return descriptor;
}

/**
 * Decorator that ensures time configuration is valid before executing the method.
 */
export function RequiresTimeConfig(target: any, propertyName: string, descriptor: PropertyDescriptor) {
	const originalMethod = descriptor.value;
	
	descriptor.value = async function (...args: any[]) {
		const configManager = getConfigurationManager(this);
		
		try {
			// Validate configuration before method execution
			await configManager.getTimeConfiguration();
			
			// Configuration is valid, proceed with original method
			return await originalMethod.apply(this, args);
			
		} catch (error) {
			if (error instanceof ConfigurationError) {
				// Configuration error was already handled by ConfigurationManager
				return;
			}
			// Re-throw non-configuration errors
			throw error;
		}
	};
	
	return descriptor;
}

/**
 * Decorator that ensures overview configuration is valid before executing the method.
 */
export function RequiresOverviewConfig(target: any, propertyName: string, descriptor: PropertyDescriptor) {
	const originalMethod = descriptor.value;
	
	descriptor.value = async function (...args: any[]) {
		const configManager = getConfigurationManager(this);
		
		try {
			// Validate configuration before method execution
			await configManager.getOverviewConfiguration();
			
			// Configuration is valid, proceed with original method
			return await originalMethod.apply(this, args);
			
		} catch (error) {
			if (error instanceof ConfigurationError) {
				// Configuration error was already handled by ConfigurationManager
				return;
			}
			// Re-throw non-configuration errors
			throw error;
		}
	};
	
	return descriptor;
}

/**
 * Decorator that ensures specific configuration keys are present before executing the method.
 * @param requiredKeys Array of configuration keys that must be present
 */
export function RequiresConfigKeys(requiredKeys: string[]) {
	return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
		const originalMethod = descriptor.value;
		
		descriptor.value = async function (...args: any[]) {
			const configManager = getConfigurationManager(this);
			
			try {
				// Validate each required key
				for (const key of requiredKeys) {
					await configManager.getConfigValue(key, undefined, true);
				}
				
				// All required keys are present, proceed with original method
				return await originalMethod.apply(this, args);
				
			} catch (error) {
				if (error instanceof ConfigurationError) {
					// Configuration error was already handled by ConfigurationManager
					return;
				}
				// Re-throw non-configuration errors
				throw error;
			}
		};
		
		return descriptor;
	};
}

/**
 * Utility function to get the ConfigurationManager from a class instance.
 * This assumes the class has a configurationManager property or can access one through ServiceLocator.
 */
function getConfigurationManager(instance: any): ConfigurationManager {
	// Check if the instance has a configurationManager property
	if (instance.configurationManager && instance.configurationManager instanceof ConfigurationManager) {
		return instance.configurationManager;
	}
	
	// Check if the instance has access to ServiceLocator
	if (instance.getService && typeof instance.getService === 'function') {
		try {
			return instance.getService(ConfigurationManager);
		} catch (error) {
			// ServiceLocator might not have ConfigurationManager registered
		}
	}
	
	// Fallback: check for configManager property (alternative naming)
	if (instance.configManager && instance.configManager instanceof ConfigurationManager) {
		return instance.configManager;
	}
	
	throw new Error('ConfigurationManager not found. Ensure the class has a configurationManager property or access to ServiceLocator.');
}

/**
 * Helper function to create a method that validates configuration and returns the config object.
 * This can be used in classes that need both validation and access to the configuration.
 */
export function withAzureDevOpsConfig<T>(
	method: (config: import('./configuration-schemas').AzureDevOpsConfiguration, ...args: any[]) => Promise<T>
) {
	return async function (this: any, ...args: any[]): Promise<T> {
		const configManager = getConfigurationManager(this);
		const config = await configManager.getAzureDevOpsConfiguration();
		return method.call(this, config, ...args);
	};
}

/**
 * Helper function to create a method that validates time configuration and returns the config object.
 */
export function withTimeConfig<T>(
	method: (config: import('./configuration-schemas').TimeConfiguration, ...args: any[]) => Promise<T>
) {
	return async function (this: any, ...args: any[]): Promise<T> {
		const configManager = getConfigurationManager(this);
		const config = await configManager.getTimeConfiguration();
		return method.call(this, config, ...args);
	};
}

/**
 * Helper function to create a method that validates overview configuration and returns the config object.
 */
export function withOverviewConfig<T>(
	method: (config: import('./configuration-schemas').OverviewConfiguration, ...args: any[]) => Promise<T>
) {
	return async function (this: any, ...args: any[]): Promise<T> {
		const configManager = getConfigurationManager(this);
		const config = await configManager.getOverviewConfiguration();
		return method.call(this, config, ...args);
	};
}
