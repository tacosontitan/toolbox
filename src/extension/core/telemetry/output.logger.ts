import * as vscode from 'vscode';
import { LogLevel } from './log-level';
import { ILogger } from "./logger";

/**
 * Represents a logger that writes messages to a Visual Studio Code output channel.
 */
export class OutputLogger implements ILogger {
    private outputChannel: vscode.OutputChannel;

    /**
     * Creates an {@link ILogger} instance that logs messages to a Visual Studio Code output channel.
     * @param channelName The name of the output channel to create for logging.
     */
    constructor(channelName: string) {
        this.outputChannel = vscode.window.createOutputChannel(channelName);
    }

    /** @inheritdoc */
    public log(level: LogLevel, message: string): void {
        if (level < LogLevel.Trace || level > LogLevel.Critical) {
            return;
        }

        const timestamp = new Date().toISOString();
        const logLevel = OutputLogger.getLogLevelString(level);
        const formattedMessage = `${timestamp} (${logLevel}): ${message}`;
        this.outputChannel.appendLine(formattedMessage);
    }

    /** @inheritdoc */
    public logError(message: string, error: any): void {
        const timestamp = new Date().toISOString();
        const errorMessage = error instanceof Error ? `${message} ${error.message}` : message;
        const formattedMessage = `${timestamp} (error): ${errorMessage}\n${error.stack}`;
        this.outputChannel.appendLine(formattedMessage);
    }

    /** @inheritdoc */
    public open(): void {
        this.outputChannel.show();
    }

    private static getLogLevelString(level: LogLevel): string {
        switch (level) {
            case LogLevel.Trace:
                return 'trace';
            case LogLevel.Debug:
                return 'debug';
            case LogLevel.Information:
                return 'info';
            case LogLevel.Warning:
                return 'warn';
            case LogLevel.Error:
                return 'error';
            case LogLevel.Critical:
                return 'critical';
            default:
                return 'unknown';
        }
    }
}