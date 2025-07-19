import { ConfigurationError } from "./configuration-error";

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