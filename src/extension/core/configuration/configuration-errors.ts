/**
 * Configuration-related error types for better error handling and user experience.
 */

/**
 * Base class for configuration-related errors
 */
export abstract class ConfigurationError extends Error {
	public abstract readonly errorCode: string;
	public abstract readonly userMessage: string;
	public abstract readonly logMessage: string;
	
	constructor(message: string, public readonly configKey?: string) {
		super(message);
		this.name = this.constructor.name;
	}
}

/**
 * Error thrown when required configuration is missing
 */
export class MissingConfigurationError extends ConfigurationError {
	public readonly errorCode = 'MISSING_CONFIGURATION';
	
	constructor(
		public readonly configKey: string,
		public readonly friendlyName: string,
		public readonly setupInstructions?: string
	) {
		super(`Missing required configuration: ${configKey}`);
	}
	
	public get userMessage(): string {
		const baseMessage = `This feature requires ${this.friendlyName} to be configured.`;
		return this.setupInstructions 
			? `${baseMessage} ${this.setupInstructions}`
			: baseMessage;
	}
	
	public get logMessage(): string {
		return `Missing required configuration: ${this.configKey} (${this.friendlyName})`;
	}
}

/**
 * Error thrown when configuration value is invalid
 */
export class InvalidConfigurationError extends ConfigurationError {
	public readonly errorCode = 'INVALID_CONFIGURATION';
	
	constructor(
		public readonly configKey: string,
		public readonly currentValue: any,
		public readonly expectedFormat: string,
		public readonly friendlyName: string
	) {
		super(`Invalid configuration value for ${configKey}: ${currentValue}`);
	}
	
	public get userMessage(): string {
		return `Invalid ${this.friendlyName} configuration. Expected: ${this.expectedFormat}`;
	}
	
	public get logMessage(): string {
		return `Invalid configuration for ${this.configKey}: "${this.currentValue}" (expected: ${this.expectedFormat})`;
	}
}

/**
 * Error thrown when multiple configuration values are missing
 */
export class MultipleConfigurationError extends ConfigurationError {
	public readonly errorCode = 'MULTIPLE_MISSING_CONFIGURATION';
	
	constructor(
		public readonly missingKeys: string[],
		public readonly configurationArea: string
	) {
		super(`Multiple configuration values missing for ${configurationArea}: ${missingKeys.join(', ')}`);
	}
	
	public get userMessage(): string {
		return `${this.configurationArea} configuration is incomplete. Please configure the following settings: ${this.missingKeys.join(', ')}`;
	}
	
	public get logMessage(): string {
		return `Multiple missing configuration values for ${this.configurationArea}: [${this.missingKeys.join(', ')}]`;
	}
}

/**
 * Friendly names for configuration keys (used in error messages)
 */
export const ConfigurationFriendlyNames = {
	'azureDevOps.organization': 'Azure DevOps Organization',
	'azureDevOps.project': 'Azure DevOps Project',
	'azureDevOps.userDisplayName': 'User Display Name',
	'azureDevOps.personalAccessToken': 'Personal Access Token',
	'azureDevOps.readyTaskState': 'Ready Task State',
	'azureDevOps.inProgressTaskState': 'In Progress Task State',
	'azureDevOps.doneTaskState': 'Done Task State',
	'azureDevOps.showInactiveTasks': 'Show Inactive Tasks',
	'time.autoCleanup': 'Auto Cleanup',
	'time.retentionDays': 'Retention Days',
	'time.defaultPrecisionMinutes': 'Default Precision Minutes',
	'overview.recentCompletionsDays': 'Recent Completions Days',
	'overview.showProductivityMetrics': 'Show Productivity Metrics',
	'overview.refreshIntervalMinutes': 'Refresh Interval Minutes'
} as const;

/**
 * Setup instructions for common configuration scenarios
 */
export const SetupInstructions = {
	AZURE_DEVOPS_PAT: 'Go to Azure DevOps → User Settings → Personal Access Tokens to create one.',
	AZURE_DEVOPS_ORG: 'Enter your Azure DevOps organization name or URL.',
	AZURE_DEVOPS_PROJECT: 'Enter the name of your Azure DevOps project.',
	USER_DISPLAY_NAME: 'Enter your display name as it appears in Azure DevOps.'
} as const;
