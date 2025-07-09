import * as vscode from 'vscode';
import { ISourceControlService } from './source-control/source-control.service';
import { ILogger } from './telemetry';

/**
 * Defines members for handling non-functional requirements of the extension.
 */
export abstract class IAssistant {
	/**
	 * The extension context provided by Visual Studio Code.
	 */
	abstract get extensionContext(): vscode.ExtensionContext;

	/**
	 * Gets the logger for the extension.
	 * @returns The logger instance.
	 */
	abstract get logger(): ILogger;

	/**
	 * Prompts the user for input.
	 * @param prompt The message to display to the user.
	 * @returns A promise that resolves to the user's input.
	 */
	abstract promptUser(prompt: string): Promise<string | undefined>;

	/**
	 * Prompts the user for confirmation.
	 * @param message The message to display to the user.
	 * @returns A promise that resolves to the user's confirmation.
	 */
	abstract confirmUser(message: string): Promise<boolean>;
}

/**
 * Implements the {@link IAssistant} interface to provide runtime support of non-functional requirements for the extension.
 */
export class RuntimeAssistant implements IAssistant {
	private outputChannel: vscode.OutputChannel;

	/**
	 * Creates a new {@link IAssistant} instance.
	 * @param context The extension context provided by Visual Studio Code.
	 */
	constructor(
		private readonly loggerService: ILogger,
		private readonly sourceControlService: ISourceControlService,
		private readonly context: vscode.ExtensionContext) {
		this.outputChannel = vscode.window.createOutputChannel("Hazel's Toolbox");
	}

	/** @inheritdoc */
	get logger(): ILogger {
		return this.loggerService;
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
	promptUser(prompt: string): Promise<string | undefined> {
		return new Promise((resolve) => {
			vscode.window.showInputBox({ prompt }).then(resolve);
		});
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
