import { Command } from '../command';

/**
 * Interface for individual command factories that create a specific command type.
 * Each command should have its own factory implementation.
 */
export interface ICommandFactory<T extends Command = Command> {
	/**
	 * Gets the command type that this factory can create.
	 */
	readonly commandType: new (...args: any[]) => T;

	/**
	 * Creates an instance of the command with all dependencies injected.
	 * @returns A new instance of the command.
	 */
	create(): T;

	/**
	 * Determines if this factory can create the specified command type.
	 * @param commandType The command type to check.
	 * @returns True if this factory can create the command type.
	 */
	canCreate(commandType: new (...args: any[]) => Command): boolean;
}

/**
 * Interface for the main command factory registry that manages all individual command factories.
 */
export interface ICommandFactoryRegistry {
	/**
	 * Registers a command factory for a specific command type.
	 * @param factory The command factory to register.
	 */
	registerFactory<T extends Command>(factory: ICommandFactory<T>): void;

	/**
	 * Creates a command instance of the specified type.
	 * @param commandType The constructor function for the command type.
	 * @returns A new instance of the command.
	 * @throws Error if no factory is registered for the command type.
	 */
	create<T extends Command>(commandType: new (...args: any[]) => T): T;

	/**
	 * Checks if a factory is registered for the specified command type.
	 * @param commandType The command type to check.
	 * @returns True if a factory is registered for the command type.
	 */
	canCreate(commandType: new (...args: any[]) => Command): boolean;
}
