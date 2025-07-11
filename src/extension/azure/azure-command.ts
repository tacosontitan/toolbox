import { Command } from "../core/command";

/**
 * Represents a {@link Command} that is focused on Azure operations.
 */
export abstract class AzureCommand
	extends Command {
	/**
	 * Creates a new {@link AzureCommand} with the specified ID.
	 * @param id The unique identifier for the command.
	 */
	protected constructor(
		id: string,
	) {
		super(`azure.${id}`);
	}
}