/**
 * Defines members for configuring time tracking in the extension.
 */
export interface TimeOptions {
    /**
     * Indicates whether or not old time entries should be automatically purged.
     */
    autoPurge: boolean;

    /**
     * The number of days to retain time entries before they are purged.
     */
    retentionPeriod: number;
}