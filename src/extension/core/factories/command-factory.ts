import { Command } from '../command';
import { ICommandFactory, ICommandFactoryRegistry } from './command-factory.interface';

/**
 * Main command factory registry that manages individual command factories.
 * This follows the exact pattern from your C# example with 1:1 command-to-factory mapping.
 */
export class CommandFactoryRegistry implements ICommandFactoryRegistry {
	private readonly _factories: ICommandFactory[] = [];

	/**
	 * Registers a command factory for a specific command type.
	 */
	public registerFactory<T extends Command>(factory: ICommandFactory<T>): void {
		this._factories.push(factory);
	}

	/**
	 * Creates a command instance using the registered factories.
	 * This implements your exact C# pattern: iterate through factories and tryCreate.
	 */
	public create<T extends Command>(commandType: new (...args: any[]) => T): T {
		// Your C# pattern: foreach (var factory in _commandFactories)
		for (const factory of this._factories) {
			// Your C# pattern: if (factory.TryCreate(typeof(TCommand), out TCommand result))
			if (factory.canCreate(commandType)) {
				return factory.create() as T;
			}
		}

		// If no factory can handle this command type, throw an error
		throw new Error(`No factory registered for command type: ${commandType.name}`);
	}

	/**
	 * Checks if a factory is registered for the specified command type.
	 */
	public canCreate(commandType: new (...args: any[]) => Command): boolean {
		return this._factories.some(factory => factory.canCreate(commandType));
	}

	/**
	 * Gets all registered factories (useful for debugging/introspection).
	 */
	public getRegisteredFactories(): ICommandFactory[] {
		return [...this._factories];
	}

	/**
	 * Gets the number of registered factories.
	 */
	public get factoryCount(): number {
		return this._factories.length;
	}
}
