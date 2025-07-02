import { IServiceProvider } from "../dependency-injection";
import { ICommandProvider } from "./command-provider";

/**
 * Defines members for registering commands.
 */
export interface IRegistrar {
	/**
	 * Registers all commands with the provided command provider.
	 * @param serviceProvider The service provider to resolve dependencies.
	 * @param commands The command provider to register commands with.
	 */
	registerCommands(serviceProvider: IServiceProvider, commands: ICommandProvider): void;
}