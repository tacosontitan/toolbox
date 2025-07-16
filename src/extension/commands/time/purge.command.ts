import { Command } from "../../core";
import { TimeEntryService, TimeTreeDataProvider } from "../../time";

/**
 * Command to clean up old time entries based on retention policy
 */
export class CleanupOldEntriesCommand extends Command {
    constructor(
        private timeEntryService: TimeEntryService,
        private treeProvider: TimeTreeDataProvider
    ) {
        super('time.cleanupOldEntries');
    }

    async execute(): Promise<void> {
        await this.timeEntryService.cleanupOldEntries(true);
        this.treeProvider.refresh();
    }
}