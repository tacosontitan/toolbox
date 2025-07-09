/**
 * @module LogLevel
 * @description Defines the different log levels for telemetry.
 * These levels are used to categorize log messages based on their severity and importance.
 * The levels are ordered from most detailed (Trace) to least detailed (None).
 */
export enum LogLevel {
    /**
     * Contains the most detailed messages. These messages may contain sensitive app data. These messages are disabled by default and should not be enabled in production.
     */
    Trace = 0,

    /**
     * For debugging and development. Use with caution in production due to the high volume.
     */
    Debug = 1,

    /**
     * Tracks the general flow of the app. May have long-term value.
     */
    Information = 2,

    /**
     * For abnormal or unexpected events. Typically includes errors or conditions that don't cause the app to fail.
     */
    Warning = 3,

    /**
     * For errors and exceptions that cannot be handled. These messages indicate a failure in the current operation or request, not an app-wide failure.
     */
    Error = 4,

    /**
     * For failures that require immediate attention. Examples: data loss scenarios, out of disk space.
     */
    Critical = 5,

    /**
     * Specifies that no messages should be written.
     */
    None = 6
}