import { TimeTreeDataProvider } from "../../../application/providers/time-tree-data-provider";
import { TimeEntryService } from "../../../application/time/time-entry-service";
import { Command } from "../../../core";

/**
 * Command to clear all time entries (for testing/debugging)
 */
export class ClearTimeEntriesCommand extends Command {
    constructor(
        private timeEntryService: TimeEntryService,
        private treeProvider: TimeTreeDataProvider
    ) {
        super('time.clear');
    }

    async execute(): Promise<void> {
        await this.timeEntryService.clearAllEntries();
        this.treeProvider.refresh();
    }
}