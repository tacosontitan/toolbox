import { ConfigurationError } from "./configuration-error";

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