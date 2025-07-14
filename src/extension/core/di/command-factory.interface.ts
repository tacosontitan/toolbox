import * as vscode from 'vscode';
import { Command } from '../command';

/**
 * Interface for creating commands with proper dependency injection.
 */
export interface ICommandFactory {
    /**
     * Creates all commands for the extension.
     */
    createCommands(): Command[];

    /**
     * Creates tree view commands that require a tree provider.
     */
    createTreeViewCommands(treeProvider: any): Command[];

    /**
     * Creates task state commands that require special registration.
     */
    createTaskStateCommands(treeProvider: any): Command[];
}