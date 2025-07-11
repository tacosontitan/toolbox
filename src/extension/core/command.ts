/**
 * Represents a command that can be executed within the Visual Studio Code extension.
 */
export abstract class Command {
	/**
	 * Creates a new command instance with the specified identifier.
	 * @param id The unique identifier for the command.
	 */
	constructor(
		id: string,
	) {
		this.id = `tacosontitan.toolbox.${id}`;
	}

	/**
	 * The unique identifier for the command.
	 */
	public id: string;

	/**
	 * Executes the command.
	 * @param args The arguments to pass to the command.
	 */
	public abstract execute(): Promise<void>;
}