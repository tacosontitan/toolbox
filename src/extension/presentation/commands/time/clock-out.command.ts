import { TimeTreeDataProvider } from "../../../application/providers/time-tree-data-provider";
import { TimeEntryService } from "../../../application/time/time-entry-service";
import { Command } from "../../../core";

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