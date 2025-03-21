import { ICommandProvider } from "./command-provider";

/**
 * Defines members for registering commands.
 */
export interface IRegistrar {
	/**
	 * Registers all commands with the provided command provider.
	 * @param commands The command provider to register commands with.
	 */
	registerCommands(commands: ICommandProvider): void;
}