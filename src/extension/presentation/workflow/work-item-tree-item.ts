import * as vscode from 'vscode';
import { WorkItem } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';

export class WorkItemTreeItem extends vscode.TreeItem {
    constructor(
        public readonly workItem: WorkItem,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState
    ) {
        super(`#${workItem.id} ${workItem.fields?.['System.Title']}`, collapsibleState);
        this.tooltip = `${workItem.fields?.['System.WorkItemType']}: ${workItem.fields?.['System.Title']}\nState: ${workItem.fields?.['System.State']}\nAssigned To: ${workItem.fields?.['System.AssignedTo']?.displayName || 'Unassigned'}`;
        this.description = `${workItem.fields?.['System.WorkItemType']} - ${workItem.fields?.['System.State']}`;
        this.contextValue = 'workItem';
        
        // Set icon based on work item type
        const workItemType = workItem.fields?.['System.WorkItemType'];
        if (workItemType === 'User Story') {
            this.iconPath = new vscode.ThemeIcon('person', new vscode.ThemeColor('charts.blue'));
        } else if (workItemType === 'Bug') {
            this.iconPath = new vscode.ThemeIcon('bug', new vscode.ThemeColor('charts.red'));
        } else if (workItemType === 'Feature') {
            this.iconPath = new vscode.ThemeIcon('package', new vscode.ThemeColor('charts.purple'));
        } else {
            this.iconPath = new vscode.ThemeIcon('bookmark', new vscode.ThemeColor('charts.gray'));
        }
    }
}