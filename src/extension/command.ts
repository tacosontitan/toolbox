
import { IAssistant } from './assistant';
import { IServiceProvider } from './dependency-injection';

/**
 * Represents a command that can be executed within the Visual Studio Code extension.
 */
export abstract class Command {
	/**
	 * The assistant instance that provides context and functionality for the command.
	 */
	private _assistant: IAssistant | undefined;

	/**
	 * Creates a new command instance with the specified identifier.
	 * @param id The unique identifier for the command.
	 */
	constructor(id: string) {
		this.id = `tacosontitan.toolbox.${id}`;
	}

	/**
	 * The unique identifier for the command.
	 */
	public id: string;

	/**
	 * Gets the assistant instance associated with this command.
	 */
	public get assistant(): IAssistant {
		if (!this._assistant) {
			throw new Error(`Assistant is not set for command ${this.id}.`);
		}

		return this._assistant;
	}

	public execute(serviceProvider: IServiceProvider, ...args: any[]): Promise<void> {
		if (!this._assistant) {
			this._assistant = serviceProvider.getRequiredService(IAssistant);
		}

		return this.executeCommand(...args);
	}

	/**
	 * Executes the command.
	 * @param args The arguments to pass to the command.
	 */
	protected abstract executeCommand(...args: any[]): Promise<void>;
}