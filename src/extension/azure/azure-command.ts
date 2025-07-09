import { Command } from "../command";
import { IServiceProvider } from "../dependency-injection";

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
		serviceProvider: IServiceProvider
	) {
		super(`azure.${id}`, serviceProvider);
	}
}