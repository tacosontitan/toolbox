import * as vscode from 'vscode';

export class OverviewTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly description?: string,
        public readonly iconName?: string
    ) {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.description = description;
        if (iconName) {
            this.iconPath = new vscode.ThemeIcon(iconName);
        }
    }
}