import { LogLevel } from "./log-level";

/**
 * Represents a logger within the extension.
 */
export interface ILogger {
    /**
     * Logs a message with the specified level.
     * @param level The log level to use for the message.
     * @param message The message to log.
     */
    log(level: LogLevel, message: string): void;

    /**
     * Opens the logs for the user to view.
     */
    open(): void;
}