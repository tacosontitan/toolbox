import { TimeTreeDataProvider } from "../../../application/providers/time-tree-data-provider";
import { TimeEntryService } from "../../../application/time/time-entry-service";
import { Command } from "../../../core";

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