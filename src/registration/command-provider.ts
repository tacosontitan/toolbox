import { Command } from "../command";

/**
 * Defines members for managing a collection of commands.
 */
export interface ICommandProvider {
	/**
	 * Adds a command to the command provider.
	 * @param command The command to add to the provider.
	 * @returns The command provider instance for method chaining.
	 */
	add(command: Command): ICommandProvider;
	
	/**
	 * Retrieves all commands registered with the command provider.
	 * @returns An array of commands registered with the provider.
	 */
	getCommands(): Command[];
}

/**
 * Implements the {@link ICommandProvider} interface to manage a collection of commands.
 */
export class CommandProvider implements ICommandProvider {
	private commands: Command[] = [];
	
	/** @inheritdoc */
	public add(command: Command): ICommandProvider {
		this.commands.push(command);
		return this;
	}
	
	/** @inheritdoc */
	public getCommands(): Command[] {
		return this.commands;
	}
}