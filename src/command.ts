
import * as vscode from 'vscode';
import { IAssistant } from './assistant';

/**
 * Represents a command that can be executed within the Visual Studio Code extension.
 */
export abstract class Command {
	/**
	 * The unique identifier for the command.
	 */
	public id: string;
	
	/**
	 * Creates a new command instance with the specified identifier.
	 * @param id The unique identifier for the command.
	 */
	constructor(id: string) {
		this.id = `hazl.surf-shack.${id}`;
	}
	
	/**
	 * Executes the command.
	 * @param args The arguments to pass to the command.
	 */
	public abstract execute(assistant: IAssistant, ...args: any[]): Promise<void>;
}