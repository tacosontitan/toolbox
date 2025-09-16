import * as vscode from 'vscode';
import { Colors } from '../styles/colors';

export class StateGroupTreeItem extends vscode.TreeItem {
    constructor(
        public readonly stateName: string,
        public readonly taskCount: number
    ) {
        super(`${stateName} (${taskCount})`, vscode.TreeItemCollapsibleState.Expanded);

        this.contextValue = 'stateGroup';
        this.tooltip = `${taskCount} task(s) in ${stateName} state`;
        this.iconPath = StateGroupTreeItem.getIconForState(stateName);
    }

    private static getIconForState(stateName: string): vscode.ThemeIcon {
        switch (stateName) {
            case 'In Progress': return new vscode.ThemeIcon('debug-start', Colors.blue);
            case 'Ready': return new vscode.ThemeIcon('circle-outline', Colors.gray);
            case 'Closed': return new vscode.ThemeIcon('check', Colors.green);
            case 'Removed': return new vscode.ThemeIcon('trash', Colors.red);
            default: return new vscode.ThemeIcon('folder');
        }
    }
}