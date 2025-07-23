import { TimeTreeDataProvider } from "../../../application/providers/time-tree-data-provider";
import { Command } from "../../../core";

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