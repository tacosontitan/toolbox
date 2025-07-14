import * as vscode from 'vscode';
import { WorkItem } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';

export class TaskTreeItem extends vscode.TreeItem {
    constructor(
        public readonly task: WorkItem
    ) {
        super(`#${task.id} ${task.fields?.['System.Title']}`, vscode.TreeItemCollapsibleState.None);
        const state = task.fields?.['System.State'];
        const assignedTo = task.fields?.['System.AssignedTo']?.displayName || 'Unassigned';
        const remainingWork = task.fields?.['Microsoft.VSTS.Scheduling.RemainingWork'] || 0;
        
        this.tooltip = `State: ${state}\nAssigned To: ${assignedTo}\nRemaining Work: ${remainingWork}h\n\n${task.fields?.['System.Description'] || 'No description'}`;
        this.description = `${state} • ${assignedTo}`;
        
        // Set context value based on current state for context menu visibility
        const contextValues = ['task', 'draggable'];
        if (state !== 'New') {
            contextValues.push('taskCanSetToNew');
        }
        if (state !== 'Active') {
            contextValues.push('taskCanSetToActive');
        }
        if (state !== 'Resolved') {
            contextValues.push('taskCanSetToResolved');
        }
        if (state !== 'Closed') {
            contextValues.push('taskCanSetToClosed');
        }
        
        this.contextValue = contextValues.join(',');
        
        // Set icon based on task state - using colored dots as requested
        if (state === 'Done' || state === 'Closed') {
            this.iconPath = new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('charts.green'));
        } else if (state === 'Active' || state === 'In Progress') {
            this.iconPath = new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('charts.blue'));
        } else if (state === 'New' || state === 'To Do' || state === 'Ready') {
            this.iconPath = new vscode.ThemeIcon('circle-outline', new vscode.ThemeColor('charts.gray'));
        } else if (state === 'Removed') {
            this.iconPath = new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('charts.red'));
        } else {
            this.iconPath = new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('charts.blue'));
        }
    }
}