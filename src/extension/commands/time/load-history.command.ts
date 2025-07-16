import { Command } from "../../core";
import { TimeTreeDataProvider } from "../../time";

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