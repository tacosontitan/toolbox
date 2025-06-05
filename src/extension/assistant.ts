import * as vscode from 'vscode';
import { ISourceControlService } from './source-control/source-control.service';

/**
 * Defines members for handling non-functional requirements of the extension.
 */
export interface IAssistant {
	/**
	 * The extension context provided by Visual Studio Code.
	 */
	get extensionContext(): vscode.ExtensionContext;

	/**
	 * Gets the service for managing source control operations.
	 * @returns The source control service instance.
	 */
	get sourceControl(): ISourceControlService;

	/**
	 * Writes a message to the output channel.
	 * @param message The message to write to the output channel.
	 */
	writeLine(message: string): void;

	/**
	 * Shows the output channel to the user.
	 */
	showOutputChannel(): void;

	/**
	 * Prompts the user for input.
	 * @param prompt The message to display to the user.
	 * @returns A promise that resolves to the user's input.
	 */
	promptUser(prompt: string): Promise<string | undefined>;

	/**
	 * Logs a message to the output channel.
	 * @param message The message to log.
	 */
	log(message: string): void;

	/**
	 * Prompts the user for confirmation.
	 * @param message The message to display to the user.
	 * @returns A promise that resolves to the user's confirmation.
	 */
	confirmUser(message: string): Promise<boolean>;
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
	constructor(
		private readonly sourceControlService: ISourceControlService,
		private readonly context: vscode.ExtensionContext) {
		this.outputChannel = vscode.window.createOutputChannel("Hazel's Toolbox");
	}

	/** @inheritdoc */
	get sourceControl(): ISourceControlService {
		return this.sourceControlService;
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

	/** @inheritdoc */
	promptUser(prompt: string): Promise<string | undefined> {
		return new Promise((resolve) => {
			vscode.window.showInputBox({ prompt }).then(resolve);
		});
	}

	/** @inheritdoc */
	log(message: string): void {
		this.writeLine(message);
	}

	/** @inheritdoc */
	confirmUser(message: string): Promise<boolean> {
		return new Promise((resolve) => {
			vscode.window.showQuickPick(['Yes', 'No'], { placeHolder: message }).then((selection) => {
				resolve(selection === 'Yes');
			});
		});
	}
}
