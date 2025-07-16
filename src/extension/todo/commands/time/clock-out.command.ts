import { Command } from "../../../core";
import { TimeEntryService, TimeTreeDataProvider } from "../../time";

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