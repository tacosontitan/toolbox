import { LogLevel } from "./log-level";

/**
 * Represents a logger within the extension.
 */
export abstract class ILogger {
    /**
     * Logs a message with the specified level.
     * @param level The log level to use for the message.
     * @param message The message to log.
     */
    abstract log(level: LogLevel, message: string): void;

    /**
     * Logs an error message with the specified error details.
     * @param message The error message to log.
     * @param error The error object containing details about the error.
     */
    abstract logError(message: string, error: any): void;

    /**
     * Opens the logs for the user to view.
     */
    abstract open(): void;
}