import * as vscode from 'vscode';

/**
 * Defines members for handling non-functional requirements of the extension.
 */
export interface IAssistant {
	/**
	 * The extension context provided by Visual Studio Code.
	 */
	get extensionContext(): vscode.ExtensionContext;

	/**
	 * Writes a message to the output channel.
	 * @param message The message to write to the output channel.
	 */
	writeLine(message: string): void;

	/**
	 * Shows the output channel to the user.
	 */
	showOutputChannel(): void;
}

/**
 * Implements the {@link IAssistant} interface to provide runtime support of non-functional requirements for the extension.
 */
export class RuntimeAssistant implements IAssistant {
	private outputChannel: vscode.OutputChannel;

	/**
	 * Creates a new {@link RuntimeAssistant} instance.
	 * @param context The extension context provided by Visual Studio Code.
	 */
	constructor(private readonly context: vscode.ExtensionContext) {
		this.outputChannel = vscode.window.createOutputChannel("Hazel's Toolbox");
	}

	/** @inheritdoc */
	public get extensionContext(): vscode.ExtensionContext {
		return this.context;
	}

	/** @inheritdoc */
	writeLine(message: string): void {
		this.outputChannel.appendLine(message);
	}

	/** @inheritdoc */
	showOutputChannel(): void {
		this.outputChannel.show();
	}
}
