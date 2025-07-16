import * as vscode from 'vscode';
import { TimeEntry, DayTimeEntry, TimeEntryUtils } from './time-entry';

/**
 * Service for managing time entries using VS Code's global state
 */
export class TimeEntryService {
    private static readonly TIME_ENTRIES_KEY = 'tacosontitan.toolbox.timeEntries';
    private static readonly DAYS_TO_LOAD_KEY = 'tacosontitan.toolbox.daysToLoad';
    private static readonly DEFAULT_DAYS_TO_SHOW = 10;

    constructor(private context: vscode.ExtensionContext) {
        // Auto-cleanup on startup if enabled
        this.performAutoCleanupIfEnabled();
    }

    /**
     * Records a clock in event
     */
    async clockIn(): Promise<void> {
        const now = new Date();
        const entry: TimeEntry = {
            id: TimeEntryUtils.generateId(),
            type: 'clock-in',
            timestamp: now
        };

        await this.addTimeEntry(entry);
        vscode.window.showInformationMessage(`Clocked in at ${TimeEntryUtils.formatTime(now)}`);
    }

    /**
     * Records a clock out event
     */
    async clockOut(): Promise<void> {
        const now = new Date();
        const entry: TimeEntry = {
            id: TimeEntryUtils.generateId(),
            type: 'clock-out',
            timestamp: now
        };

        await this.addTimeEntry(entry);
        vscode.window.showInformationMessage(`Clocked out at ${TimeEntryUtils.formatTime(now)}`);
    }

    /**
     * Gets the current clock status (whether user is clocked in or out)
     */
    async getCurrentStatus(): Promise<'clocked-in' | 'clocked-out'> {
        const entries = await this.getAllTimeEntries();
        if (entries.length === 0) {
            return 'clocked-out';
        }

        // Find the most recent entry
        const sortedEntries = entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        const lastEntry = sortedEntries[0];

        return lastEntry.type === 'clock-in' ? 'clocked-in' : 'clocked-out';
    }

    /**
     * Gets time entries grouped by day for display
     */
    async getTimeEntriesForDisplay(): Promise<DayTimeEntry[]> {
        const daysToShow = await this.getDaysToLoad();
        const allEntries = await this.getAllTimeEntries();
        
        // Group by date
        const groupedByDate = TimeEntryUtils.groupEntriesByDate(allEntries);
        
        // Filter to only show work days (exclude weekends) and limit to requested number of days
        const workDays = groupedByDate.filter(day => {
            const date = new Date(day.date);
            const dayOfWeek = date.getDay();
            return dayOfWeek !== 0 && dayOfWeek !== 6; // 0 = Sunday, 6 = Saturday
        });

        return workDays.slice(0, daysToShow);
    }

    /**
     * Loads more days (increases the number of days to show)
     */
    async loadMoreDays(): Promise<void> {
        const currentDays = await this.getDaysToLoad();
        const newDays = currentDays + 10;
        await this.context.globalState.update(TimeEntryService.DAYS_TO_LOAD_KEY, newDays);
    }

    /**
     * Resets to show only the default number of days
     */
    async resetDaysToLoad(): Promise<void> {
        await this.context.globalState.update(TimeEntryService.DAYS_TO_LOAD_KEY, TimeEntryService.DEFAULT_DAYS_TO_SHOW);
    }

    /**
     * Gets all time entries from storage
     */
    private async getAllTimeEntries(): Promise<TimeEntry[]> {
        const stored = this.context.globalState.get<TimeEntry[]>(TimeEntryService.TIME_ENTRIES_KEY, []);
        
        // Ensure all timestamps are converted to Date objects
        return stored.map(item => ({
            id: item.id,
            type: item.type,
            timestamp: new Date(item.timestamp)
        }));
    }

    /**
     * Adds a new time entry to storage
     */
    private async addTimeEntry(entry: TimeEntry): Promise<void> {
        const entries = await this.getAllTimeEntries();
        entries.push(entry);
        
        // Sort by timestamp to maintain chronological order
        entries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        
        // Convert to plain objects for storage (JSON serialization)
        const plainEntries = entries.map(e => ({
            id: e.id,
            type: e.type,
            timestamp: e.timestamp.toISOString()
        }));
        
        await this.context.globalState.update(TimeEntryService.TIME_ENTRIES_KEY, plainEntries);
    }

    /**
     * Gets the number of days to load for display
     */
    private async getDaysToLoad(): Promise<number> {
        return this.context.globalState.get<number>(TimeEntryService.DAYS_TO_LOAD_KEY, TimeEntryService.DEFAULT_DAYS_TO_SHOW);
    }

    /**
     * Clears all time entries (for testing/debugging)
     */
    async clearAllEntries(): Promise<void> {
        await this.context.globalState.update(TimeEntryService.TIME_ENTRIES_KEY, []);
        await this.resetDaysToLoad();
        vscode.window.showInformationMessage('All time entries cleared');
    }

    /**
     * Performs automatic cleanup if enabled in settings
     */
    private async performAutoCleanupIfEnabled(): Promise<void> {
        const config = vscode.workspace.getConfiguration('tacosontitan.toolbox.time');
        const autoCleanup = config.get<boolean>('autoCleanup', true);
        
        if (autoCleanup) {
            await this.cleanupOldEntries(false); // Silent cleanup on startup
        }
    }

    /**
     * Cleans up time entries older than the retention period
     */
    async cleanupOldEntries(showMessage: boolean = true): Promise<void> {
        const config = vscode.workspace.getConfiguration('tacosontitan.toolbox.time');
        const retentionDays = config.get<number>('retentionDays', 90);
        
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
        
        const allEntries = await this.getAllTimeEntries();
        const filteredEntries = allEntries.filter(entry => entry.timestamp >= cutoffDate);
        
        const removedCount = allEntries.length - filteredEntries.length;
        
        if (removedCount > 0) {
            // Convert to plain objects for storage
            const plainEntries = filteredEntries.map(e => ({
                id: e.id,
                type: e.type,
                timestamp: e.timestamp.toISOString()
            }));
            
            await this.context.globalState.update(TimeEntryService.TIME_ENTRIES_KEY, plainEntries);
            
            if (showMessage) {
                vscode.window.showInformationMessage(`Cleaned up ${removedCount} old time entries (older than ${retentionDays} days)`);
            }
        } else if (showMessage) {
            vscode.window.showInformationMessage(`No old entries to clean up (retention period: ${retentionDays} days)`);
        }
    }
}