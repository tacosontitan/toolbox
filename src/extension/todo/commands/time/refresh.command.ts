import { Command } from "../../../core";
import { TimeTreeDataProvider } from "../../time";

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