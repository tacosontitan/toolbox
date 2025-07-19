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