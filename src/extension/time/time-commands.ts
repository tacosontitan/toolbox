import { Command } from '../core/command';
import { TimeEntryService } from './time-entry-service';
import { TimeTreeDataProvider } from './time-tree-data-provider';

/**
 * Command to clock in
 */
export class ClockInCommand extends Command {
    constructor(
        private timeEntryService: TimeEntryService,
        private treeProvider: TimeTreeDataProvider
    ) {
        super('time.clockIn');
    }

    async execute(): Promise<void> {
        await this.timeEntryService.clockIn();
        this.treeProvider.refresh();
    }
}

/**
 * Command to clock out
 */
export class ClockOutCommand extends Command {
    constructor(
        private timeEntryService: TimeEntryService,
        private treeProvider: TimeTreeDataProvider
    ) {
        super('time.clockOut');
    }

    async execute(): Promise<void> {
        await this.timeEntryService.clockOut();
        this.treeProvider.refresh();
    }
}

/**
 * Command to refresh the time tree view
 */
export class RefreshTimeCommand extends Command {
    constructor(private treeProvider: TimeTreeDataProvider) {
        super('time.refresh');
    }

    async execute(): Promise<void> {
        this.treeProvider.refresh();
    }
}

/**
 * Command to load more days in the time tree view
 */
export class LoadMoreDaysCommand extends Command {
    constructor(private treeProvider: TimeTreeDataProvider) {
        super('time.loadMore');
    }

    async execute(): Promise<void> {
        await this.treeProvider.loadMoreDays();
    }
}

/**
 * Command to clear all time entries (for testing/debugging)
 */
export class ClearTimeEntriesCommand extends Command {
    constructor(
        private timeEntryService: TimeEntryService,
        private treeProvider: TimeTreeDataProvider
    ) {
        super('time.clearAll');
    }

    async execute(): Promise<void> {
        await this.timeEntryService.clearAllEntries();
        this.treeProvider.refresh();
    }
}