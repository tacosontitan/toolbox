import * as vscode from 'vscode';
import { Command } from '../../../core/command';
import { ILogger, LogLevel } from '../../../core/telemetry';

/**
 * Command to open the Kanban Board view
 */
export class OpenKanbanBoardCommand extends Command {
    constructor(private readonly logger: ILogger) {
        super('azure.devops.openKanbanBoard');
    }

    public async execute(): Promise<void> {
        try {
            this.logger.log(LogLevel.Information, 'Opening Kanban Board...');
            
            // Focus on the kanban board view
            await vscode.commands.executeCommand('tacosontitan.toolbox.kanbanBoard.focus');
            
            this.logger.log(LogLevel.Information, 'Kanban Board opened successfully.');
        } catch (error) {
            const errorMessage = `Failed to open Kanban Board: ${(error as Error).message}`;
            this.logger.log(LogLevel.Error, errorMessage);
            vscode.window.showErrorMessage(errorMessage);
        }
    }
}