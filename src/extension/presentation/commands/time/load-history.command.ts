import { TimeTreeDataProvider } from "../../../application/providers/time-tree-data-provider";
import { Command } from "../../../core";

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