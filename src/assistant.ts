import * as vscode from 'vscode';

/**
 * Defines members for handling non-functional requirements of the extension.
 */
export interface IAssistant {
	/**
	 * Writes a message to the output channel.
	 * @param message The message to write to the output channel.
	 */
	writeLine(message: string): void;
}

/**
 * Implements the {@link IAssistant} interface to provide runtime support of non-functional requirements for the extension.
 */
export class RuntimeAssistant implements IAssistant {
	private outputChannel: vscode.OutputChannel;

	constructor() {
		this.outputChannel = vscode.window.createOutputChannel("Hazel's Toolbox");
	}

	/**
	 * Writes a message to the output channel.
	 * @param message The message to write to the output channel.
	 */
	writeLine(message: string): void {
		this.outputChannel.appendLine(message);
	}
}
