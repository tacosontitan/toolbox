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
     * Opens the logs for the user to view.
     */
    abstract open(): void;
}