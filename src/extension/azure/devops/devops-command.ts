import { IConfigurationProvider, ISecretProvider } from '../../core/configuration';
import { AzureCommand } from "../azure-command";

/**
 * Represents an {@link AzureCommand} focused on supporting Azure DevOps operations.
 */
export abstract class DevOpsCommand
	extends AzureCommand {
	/**
	 * Creates a new {@link DevOpsCommand} with the specified ID.
	 * @param id The unique identifier for the command.
	 * @param logger The logger to use for logging messages.
	 */
	protected constructor(
		id: string,
		protected readonly secretProvider: ISecretProvider,
		protected readonly configurationProvider: IConfigurationProvider
	) {
		super(`devops.${id}`);
	}


}