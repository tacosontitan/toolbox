import { Command } from "../../core";
import { TimeEntryService, TimeTreeDataProvider } from "../../time";

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