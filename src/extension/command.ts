
import { IServiceProvider } from './dependency-injection';
import { ILogger } from './telemetry';

/**
 * Represents a command that can be executed within the Visual Studio Code extension.
 */
export abstract class Command {

	/**
	 * The logger service used for recording diagnostic information.
	 */
	protected logger: ILogger;

	/**
	 * Creates a new command instance with the specified identifier.
	 * @param id The unique identifier for the command.
	 */
	constructor(
		id: string,
		serviceProvider: IServiceProvider
	) {
		this.id = `tacosontitan.toolbox.${id}`;
		this.logger = serviceProvider.getRequiredService(ILogger);
	}

	/**
	 * The unique identifier for the command.
	 */
	public id: string;

	/**
	 * Executes the command.
	 * @param args The arguments to pass to the command.
	 */
	protected abstract execute(): Promise<void>;
}