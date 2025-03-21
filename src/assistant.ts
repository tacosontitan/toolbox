import * as vscode from 'vscode';

export interface IAssistant {
	/**
	 * Writes a message to the output channel.
	 * @param message The message to write to the output channel.
	 */
	writeLine(message: string): void;
}

export class RuntimeAssistant implements IAssistant {
	private outputChannel: vscode.OutputChannel;

	constructor() {
		this.outputChannel = vscode.window.createOutputChannel("Hazel's Surf Shack");
	}

	/**
	 * Writes a message to the output channel.
	 * @param message The message to write to the output channel.
	 */
	writeLine(message: string): void {
		this.outputChannel.appendLine(message);
	}
}
