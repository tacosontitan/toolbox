import * as vscode from 'vscode';

/**
 * Tree item for placeholder content (loading, no data, etc.)
 */
export class PlaceholderTreeItem extends vscode.TreeItem {
    constructor(
        public readonly message: string,
        public readonly detail?: string,
        public readonly iconName: string = 'info'
    ) {
        super(message, vscode.TreeItemCollapsibleState.None);
        
        this.tooltip = detail || message;
        this.contextValue = 'placeholder';
        this.iconPath = new vscode.ThemeIcon(iconName);
        
        if (detail) {
            this.description = detail;
        }
    }
}