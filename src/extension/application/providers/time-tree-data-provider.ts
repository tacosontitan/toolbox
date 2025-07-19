import * as vscode from 'vscode';
import { PlaceholderTreeItem } from '../../presentation/placeholder-tree-item';
import { ClockEventTreeItem } from '../../presentation/time/clock-event-tree-item';
import { DayTreeItem } from '../../presentation/time/day-tree-item';
import { TimeEntryService } from '../time/time-entry-service';

export class TimeTreeDataProvider implements vscode.TreeDataProvider<DayTreeItem | ClockEventTreeItem | PlaceholderTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<DayTreeItem | ClockEventTreeItem | PlaceholderTreeItem | undefined | null | void> = new vscode.EventEmitter<DayTreeItem | ClockEventTreeItem | PlaceholderTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<DayTreeItem | ClockEventTreeItem | PlaceholderTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private timeEntryService: TimeEntryService) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: DayTreeItem | ClockEventTreeItem | PlaceholderTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: DayTreeItem | ClockEventTreeItem | PlaceholderTreeItem): Promise<(DayTreeItem | ClockEventTreeItem | PlaceholderTreeItem)[]> {
        if (!element) {
            // Root level - show day entries
            try {
                const dayEntries = await this.timeEntryService.getTimeEntriesForDisplay();
                
                if (dayEntries.length === 0) {
                    return [new PlaceholderTreeItem("No time entries", "Start tracking time by clocking in", 'clock')];
                }

                const result: (DayTreeItem | PlaceholderTreeItem)[] = [];
                
                // Add day entries
                for (const dayEntry of dayEntries) {
                    result.push(new DayTreeItem(dayEntry, vscode.TreeItemCollapsibleState.Collapsed));
                }
                
                // Add "Load More" option if there might be more entries
                if (dayEntries.length >= 10) {
                    const loadMoreItem = new PlaceholderTreeItem("Load more days...", "Click to load additional work days", 'arrow-down');
                    loadMoreItem.contextValue = 'loadMore';
                    result.push(loadMoreItem);
                }

                return result;
            } catch (error) {
                return [new PlaceholderTreeItem("Error loading time entries", (error as Error).message, 'error')];
            }
        }

        if (element instanceof DayTreeItem) {
            // Show clock events for this day
            const clockEvents = element.dayEntry.entries
                .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
                .map(entry => new ClockEventTreeItem(entry));
            
            if (clockEvents.length === 0) {
                return [new PlaceholderTreeItem("No entries", "No clock events for this day", 'info')];
            }
            
            return clockEvents;
        }

        // Placeholder and ClockEvent items have no children
        return [];
    }

    /**
     * Handles the "Load more days" functionality
     */
    async loadMoreDays(): Promise<void> {
        await this.timeEntryService.loadMoreDays();
        this.refresh();
    }
}