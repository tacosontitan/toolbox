import { Command } from "../../core";
import { TimeEntryService, TimeTreeDataProvider } from "../../time";

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