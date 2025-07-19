import { TasksTreeDataProvider } from "../../../application/providers/tasks-tree-data-provider";
import { IConfigurationProvider } from "../../../core";
import { IWorkItemService } from "../../../domain/workflow";
import { SetTaskStateCommand } from "./set-task-state.command";

/**
 * Command to set task state to Closed.
 */
export class SetTaskStateToClosedCommand extends SetTaskStateCommand {
    constructor(
        configurationProvider: IConfigurationProvider,
        tasksTreeProvider: TasksTreeDataProvider,
        workItemService: IWorkItemService
    ) {
        super('Closed', configurationProvider, tasksTreeProvider, workItemService, 'Closed');
    }
}