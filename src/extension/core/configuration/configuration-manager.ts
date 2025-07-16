import * as vscode from 'vscode';
import { ILogger, LogLevel } from '../telemetry';
import {
    ConfigurationError,
    ConfigurationFriendlyNames,
    InvalidConfigurationError,
    MissingConfigurationError,
    MultipleConfigurationError
} from './configuration-errors';
import { IConfigurationProvider } from './configuration-provider.interface';
import {
    AzureDevOpsConfiguration,
    ConfigurationKeys,
    DefaultConfiguration,
    OverviewConfiguration,
    TimeConfiguration
} from './configuration-schemas';
import { ISecretProvider } from './secret-provider.interface';

/**
 * Centralized configuration manager that handles validation, error messages,
 * and provides strongly-typed configuration access.
 * 
 * All methods automatically validate configuration and show user-friendly
 * error messages if anything is missing or invalid.
 */
export class ConfigurationManager {
	constructor(
		private readonly configProvider: IConfigurationProvider,
		private readonly secretProvider: ISecretProvider,
		private readonly logger: ILogger
	) {}

	/**
	 * Gets Azure DevOps configuration with automatic validation.
	 * Shows user-friendly error messages if any required fields are missing.
	 * 
	 * @returns Promise<AzureDevOpsConfiguration> - Guaranteed to be valid
	 * @throws ConfigurationError if validation fails (already handled with user messages)
	 */
	public async getAzureDevOpsConfiguration(): Promise<AzureDevOpsConfiguration> {
		try {
			const missingKeys: string[] = [];
			
			// Get all configuration values
			const organization = await this.configProvider.get<string>(ConfigurationKeys.ORGANIZATION);
			const project = await this.configProvider.get<string>(ConfigurationKeys.PROJECT);
			const userDisplayName = await this.configProvider.get<string>(ConfigurationKeys.USER_DISPLAY_NAME);
			const personalAccessToken = await this.secretProvider.get<string>(ConfigurationKeys.PERSONAL_ACCESS_TOKEN);
			
			// Validate required fields
			if (!organization) {
				missingKeys.push(ConfigurationKeys.ORGANIZATION);
			}
			if (!project) {
				missingKeys.push(ConfigurationKeys.PROJECT);
			}
			if (!userDisplayName) {
				missingKeys.push(ConfigurationKeys.USER_DISPLAY_NAME);
			}
			if (!personalAccessToken) {
				missingKeys.push(ConfigurationKeys.PERSONAL_ACCESS_TOKEN);
			}
			
			if (missingKeys.length > 0) {
				throw new MultipleConfigurationError(missingKeys, 'Azure DevOps');
			}
			
			// Get optional fields with defaults
			const readyTaskState = await this.configProvider.get<string>(ConfigurationKeys.READY_TASK_STATE) 
				?? DefaultConfiguration.READY_TASK_STATE;
			const inProgressTaskState = await this.configProvider.get<string>(ConfigurationKeys.IN_PROGRESS_TASK_STATE) 
				?? DefaultConfiguration.IN_PROGRESS_TASK_STATE;
			const doneTaskState = await this.configProvider.get<string>(ConfigurationKeys.DONE_TASK_STATE) 
				?? DefaultConfiguration.DONE_TASK_STATE;
			const showInactiveTasks = await this.configProvider.get<boolean>(ConfigurationKeys.SHOW_INACTIVE_TASKS) 
				?? DefaultConfiguration.SHOW_INACTIVE_TASKS;
			
			return {
				organization: organization!,
				project: project!,
				userDisplayName: userDisplayName!,
				personalAccessToken: personalAccessToken!,
				readyTaskState,
				inProgressTaskState,
				doneTaskState,
				showInactiveTasks
			};
			
		} catch (error) {
			if (error instanceof ConfigurationError) {
				this.handleConfigurationError(error);
				throw error;
			}
			
			this.logger.log(LogLevel.Error, `Unexpected error getting Azure DevOps configuration: ${error}`);
			throw new Error('Failed to load Azure DevOps configuration');
		}
	}

	/**
	 * Gets time tracking configuration with automatic validation and defaults.
	 * 
	 * @returns Promise<TimeConfiguration> - Guaranteed to be valid
	 * @throws ConfigurationError if validation fails (already handled with user messages)
	 */
	public async getTimeConfiguration(): Promise<TimeConfiguration> {
		try {
			const autoCleanup = await this.configProvider.get<boolean>(ConfigurationKeys.AUTO_CLEANUP) 
				?? DefaultConfiguration.AUTO_CLEANUP;
			const retentionDays = await this.configProvider.get<number>(ConfigurationKeys.RETENTION_DAYS) 
				?? DefaultConfiguration.RETENTION_DAYS;
			const defaultPrecisionMinutes = await this.configProvider.get<number>(ConfigurationKeys.DEFAULT_PRECISION_MINUTES) 
				?? DefaultConfiguration.DEFAULT_PRECISION_MINUTES;
			
			// Validate numeric values
			if (retentionDays < 1 || retentionDays > 365) {
				throw new InvalidConfigurationError(
					ConfigurationKeys.RETENTION_DAYS,
					retentionDays,
					'a number between 1 and 365',
					ConfigurationFriendlyNames[ConfigurationKeys.RETENTION_DAYS]
				);
			}
			
			if (defaultPrecisionMinutes < 1 || defaultPrecisionMinutes > 60) {
				throw new InvalidConfigurationError(
					ConfigurationKeys.DEFAULT_PRECISION_MINUTES,
					defaultPrecisionMinutes,
					'a number between 1 and 60',
					ConfigurationFriendlyNames[ConfigurationKeys.DEFAULT_PRECISION_MINUTES]
				);
			}
			
			return {
				autoCleanup,
				retentionDays,
				defaultPrecisionMinutes
			};
			
		} catch (error) {
			if (error instanceof ConfigurationError) {
				this.handleConfigurationError(error);
				throw error;
			}
			
			this.logger.log(LogLevel.Error, `Unexpected error getting time configuration: ${error}`);
			throw new Error('Failed to load time tracking configuration');
		}
	}

	/**
	 * Gets overview/dashboard configuration with automatic validation and defaults.
	 * 
	 * @returns Promise<OverviewConfiguration> - Guaranteed to be valid
	 * @throws ConfigurationError if validation fails (already handled with user messages)
	 */
	public async getOverviewConfiguration(): Promise<OverviewConfiguration> {
		try {
			const recentCompletionsDays = await this.configProvider.get<number>(ConfigurationKeys.RECENT_COMPLETIONS_DAYS) 
				?? DefaultConfiguration.RECENT_COMPLETIONS_DAYS;
			const showProductivityMetrics = await this.configProvider.get<boolean>(ConfigurationKeys.SHOW_PRODUCTIVITY_METRICS) 
				?? DefaultConfiguration.SHOW_PRODUCTIVITY_METRICS;
			const refreshIntervalMinutes = await this.configProvider.get<number>(ConfigurationKeys.REFRESH_INTERVAL_MINUTES) 
				?? DefaultConfiguration.REFRESH_INTERVAL_MINUTES;
			
			// Validate ranges
			if (recentCompletionsDays < 1 || recentCompletionsDays > 30) {
				throw new InvalidConfigurationError(
					ConfigurationKeys.RECENT_COMPLETIONS_DAYS,
					recentCompletionsDays,
					'a number between 1 and 30',
					ConfigurationFriendlyNames[ConfigurationKeys.RECENT_COMPLETIONS_DAYS]
				);
			}
			
			if (refreshIntervalMinutes < 1 || refreshIntervalMinutes > 60) {
				throw new InvalidConfigurationError(
					ConfigurationKeys.REFRESH_INTERVAL_MINUTES,
					refreshIntervalMinutes,
					'a number between 1 and 60',
					ConfigurationFriendlyNames[ConfigurationKeys.REFRESH_INTERVAL_MINUTES]
				);
			}
			
			return {
				recentCompletionsDays,
				showProductivityMetrics,
				refreshIntervalMinutes
			};
			
		} catch (error) {
			if (error instanceof ConfigurationError) {
				this.handleConfigurationError(error);
				throw error;
			}
			
			this.logger.log(LogLevel.Error, `Unexpected error getting overview configuration: ${error}`);
			throw new Error('Failed to load overview configuration');
		}
	}

	/**
	 * Gets a single configuration value with optional validation.
	 */
	public async getConfigValue<T>(
		key: string, 
		defaultValue?: T, 
		required: boolean = false
	): Promise<T | undefined> {
		try {
			const value = await this.configProvider.get<T>(key);
			
			if (required && (value === undefined || value === null)) {
				const friendlyName = ConfigurationFriendlyNames[key as keyof typeof ConfigurationFriendlyNames] || key;
				throw new MissingConfigurationError(key, friendlyName);
			}
			
			return value ?? defaultValue;
			
		} catch (error) {
			if (error instanceof ConfigurationError) {
				this.handleConfigurationError(error);
				throw error;
			}
			
			this.logger.log(LogLevel.Error, `Error getting configuration value '${key}': ${error}`);
			throw error;
		}
	}

	/**
	 * Sets a configuration value.
	 */
	public async setConfigValue<T>(key: string, value: T): Promise<void> {
		try {
			await this.configProvider.set(key, value);
			this.logger.log(LogLevel.Information, `Configuration updated: ${key}`);
		} catch (error) {
			this.logger.log(LogLevel.Error, `Failed to set configuration value '${key}': ${error}`);
			throw error;
		}
	}

	/**
	 * Validates if Azure DevOps configuration is complete without throwing errors.
	 */
	public async validateAzureDevOpsConfiguration(): Promise<{ isValid: boolean; missingKeys: string[] }> {
		try {
			await this.getAzureDevOpsConfiguration();
			return { isValid: true, missingKeys: [] };
		} catch (error) {
			if (error instanceof MultipleConfigurationError) {
				return { isValid: false, missingKeys: error.missingKeys };
			}
			if (error instanceof MissingConfigurationError) {
				return { isValid: false, missingKeys: [error.configKey] };
			}
			return { isValid: false, missingKeys: ['unknown'] };
		}
	}

	/**
	 * Opens VS Code settings to the extension's configuration section.
	 */
	public async openSettings(): Promise<void> {
		await vscode.commands.executeCommand('workbench.action.openSettings', 'tacosontitan.toolbox');
	}

	/**
	 * Handles configuration errors by showing user-friendly messages and logging details.
	 */
	private handleConfigurationError(error: ConfigurationError): void {
		// Log detailed error for debugging
		this.logger.log(LogLevel.Error, error.logMessage);
		
		// Show user-friendly message
		vscode.window.showErrorMessage(error.userMessage, 'Open Settings')
			.then(selection => {
				if (selection === 'Open Settings') {
					this.openSettings();
				}
			});
	}
}
