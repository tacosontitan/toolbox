import * as vscode from 'vscode';

export class StateGroupTreeItem extends vscode.TreeItem {
    constructor(
        public readonly stateName: string,
        public readonly taskCount: number
    ) {
        super(`${stateName} (${taskCount})`, vscode.TreeItemCollapsibleState.Expanded);
        this.tooltip = `${taskCount} task(s) in ${stateName} state`;
        this.contextValue = 'stateGroup,droppable';
        
        // Set icon based on state
        if (stateName === 'In Progress') {
            this.iconPath = new vscode.ThemeIcon('debug-start', new vscode.ThemeColor('charts.blue'));
        } else if (stateName === 'Ready') {
            this.iconPath = new vscode.ThemeIcon('circle-outline', new vscode.ThemeColor('charts.gray'));
        } else if (stateName === 'Closed') {
            this.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('charts.green'));
        } else if (stateName === 'Removed') {
            this.iconPath = new vscode.ThemeIcon('trash', new vscode.ThemeColor('charts.red'));
        } else {
            this.iconPath = new vscode.ThemeIcon('folder');
        }
    }
}