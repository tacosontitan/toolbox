import * as vscode from 'vscode';
import { TimeEntry, TimeEntryUtils } from '../../domain/time/time-entry';

/**
 * Tree item representing a clock in or clock out event
 */
export class ClockEventTreeItem extends vscode.TreeItem {
    constructor(
        public readonly timeEntry: TimeEntry
    ) {
        const time = TimeEntryUtils.formatTime(timeEntry.timestamp);
        const action = timeEntry.type === 'clock-in' ? 'clocked in' : 'clocked out';
        const label = `${action} @ ${time}`;
        
        super(label, vscode.TreeItemCollapsibleState.None);
        
        this.tooltip = `${action} at ${timeEntry.timestamp.toLocaleString()}`;
        this.contextValue = `clockEvent-${timeEntry.type}`;
        
        // Use different icons for clock in vs clock out
        if (timeEntry.type === 'clock-in') {
            this.iconPath = new vscode.ThemeIcon('play', new vscode.ThemeColor('charts.green'));
        } else {
            this.iconPath = new vscode.ThemeIcon('stop', new vscode.ThemeColor('charts.red'));
        }
        
        // Show full timestamp as description
        this.description = timeEntry.timestamp.toLocaleTimeString();
    }
}