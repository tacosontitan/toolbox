/**
 * Represents a single time tracking event (clock in or clock out)
 */
export interface TimeEntry {
    id: string;
    type: 'clock-in' | 'clock-out';
    timestamp: Date;
}

/**
 * Represents a day's worth of time entries with calculated totals
 */
export interface DayTimeEntry {
    date: string; // YYYY-MM-DD format
    entries: TimeEntry[];
    totalHours: number;
    totalMinutes: number;
    formattedDuration: string; // e.g., "8 hours 15 minutes"
}

/**
 * Utility functions for working with time entries
 */
export class TimeEntryUtils {
    /**
     * Formats a date as YYYY-MM-DD
     */
    static formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    /**
     * Formats a date as MM/DD/YYYY
     */
    static formatDisplayDate(date: Date): string {
        return date.toLocaleDateString('en-US');
    }

    /**
     * Formats time as HHMM (e.g., "0755")
     */
    static formatTime(date: Date): string {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}${minutes}`;
    }

    /**
     * Calculates total work time for a day from time entries
     */
    static calculateDayTotal(entries: TimeEntry[]): { hours: number; minutes: number; formatted: string } {
        let totalMinutes = 0;
        
        // Sort entries by timestamp
        const sortedEntries = [...entries].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
        
        for (let i = 0; i < sortedEntries.length - 1; i += 2) {
            const clockIn = sortedEntries[i];
            const clockOut = sortedEntries[i + 1];
            
            // Only count if we have a matching pair (clock-in followed by clock-out)
            if (clockIn.type === 'clock-in' && clockOut?.type === 'clock-out') {
                const diff = clockOut.timestamp.getTime() - clockIn.timestamp.getTime();
                totalMinutes += diff / (1000 * 60); // Convert milliseconds to minutes
            }
        }
        
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.round(totalMinutes % 60);
        
        let formatted = '';
        if (hours > 0) {
            formatted += `${hours} hour${hours !== 1 ? 's' : ''}`;
        }
        if (minutes > 0) {
            if (formatted) {
                formatted += ' ';
            }
            formatted += `${minutes} minute${minutes !== 1 ? 's' : ''}`;
        }
        if (!formatted) {
            formatted = '0 minutes';
        }
        
        return { hours, minutes, formatted };
    }

    /**
     * Groups time entries by date
     */
    static groupEntriesByDate(entries: TimeEntry[]): DayTimeEntry[] {
        const grouped = new Map<string, TimeEntry[]>();
        
        for (const entry of entries) {
            const dateKey = this.formatDate(entry.timestamp);
            if (!grouped.has(dateKey)) {
                grouped.set(dateKey, []);
            }
            grouped.get(dateKey)!.push(entry);
        }
        
        const result: DayTimeEntry[] = [];
        for (const [date, dayEntries] of grouped) {
            const total = this.calculateDayTotal(dayEntries);
            result.push({
                date,
                entries: dayEntries,
                totalHours: total.hours,
                totalMinutes: total.minutes,
                formattedDuration: total.formatted
            });
        }
        
        // Sort by date descending (most recent first)
        return result.sort((a, b) => b.date.localeCompare(a.date));
    }

    /**
     * Generates a unique ID for a time entry
     */
    static generateId(): string {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
}