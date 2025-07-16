import * as vscode from 'vscode';
import { Command } from '../../core/command';
import { ConfigurationManager } from "../../core/configuration";
import { IWorkItemService } from '../core/workflow';
import { TasksTreeDataProvider } from '../providers/tasks-tree-data-provider';

/**
 * Command to add a new task to the current work item.
 * REFACTORED: Now uses ConfigurationManager for simplified dependencies!
 */
export class AddTaskCommand extends Command {
    constructor(
        private readonly configurationManager: ConfigurationManager,
        private tasksTreeProvider: TasksTreeDataProvider,
        private workItemService: IWorkItemService
    ) {
        super('addTask');
    }

    async execute(...args: any[]): Promise<void> {
        // Get all active work items from the tree provider
        const activeWorkItems = this.tasksTreeProvider.getActiveWorkItems();
        if (!activeWorkItems || activeWorkItems.length === 0) {
            vscode.window.showErrorMessage('No active work items found. Please ensure you have bugs or user stories assigned to you.');
            return;
        }

        let selectedWorkItemId: number;

        if (activeWorkItems.length === 1) {
            // If there's only one work item, use it directly
            selectedWorkItemId = activeWorkItems[0].id!;
        } else {
            // Let user select which work item to add the task to
            const workItemOptions = activeWorkItems.map(wi => ({
                label: `#${wi.id} - ${wi.fields?.['System.Title'] || 'Untitled'}`,
                detail: `${wi.fields?.['System.WorkItemType']} - ${wi.fields?.['System.State']}`,
                workItemId: wi.id!
            }));

            const selectedOption = await vscode.window.showQuickPick(workItemOptions, {
                placeHolder: 'Select work item to add task to'
            });

            if (!selectedOption) {
                return; // User cancelled
            }

            selectedWorkItemId = selectedOption.workItemId;
        }

        const title = await vscode.window.showInputBox({
            prompt: 'Enter the title for the new task',
            placeHolder: 'e.g., Implement user authentication'
        });

        if (!title || title.trim() === '') {
            return;
        }

        const description = await vscode.window.showInputBox({
            prompt: 'Enter a description for the task (optional)',
            placeHolder: 'Detailed description of the task...'
        });

        try {
            await this.workItemService.createTask(selectedWorkItemId, title.trim(), description?.trim() || '');
            vscode.window.showInformationMessage(`Task "${title}" created successfully on work item #${selectedWorkItemId}`);
            this.tasksTreeProvider.refresh();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to create task: ${(error as Error).message}`);
        }
    }
}