import * as vscode from 'vscode';
import { DayTimeEntry, TimeEntryUtils } from '../../domain/time/time-entry';

/**
 * Tree item representing a single day's time entries
 */
export class DayTreeItem extends vscode.TreeItem {
    constructor(
        public readonly dayEntry: DayTimeEntry,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        const displayDate = TimeEntryUtils.formatDisplayDate(new Date(dayEntry.date));
        const label = `${displayDate} - ${dayEntry.formattedDuration}`;
        
        super(label, collapsibleState);
        
        this.tooltip = `${displayDate}: ${dayEntry.formattedDuration}`;
        this.contextValue = 'dayEntry';
        
        // Use calendar icon for day entries
        this.iconPath = new vscode.ThemeIcon('calendar');
        
        // Show description with the date
        this.description = this.getDayOfWeek(new Date(dayEntry.date));
    }

    private getDayOfWeek(date: Date): string {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[date.getDay()];
    }
}