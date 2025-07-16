import * as vscode from 'vscode';

export class PlaceholderTreeItem extends vscode.TreeItem {
    constructor(label: string, description: string, iconName: string = 'info') {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.description = description;
        this.contextValue = 'placeholder';
        this.iconPath = new vscode.ThemeIcon(iconName);
    }
}