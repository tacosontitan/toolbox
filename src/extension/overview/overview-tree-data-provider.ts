import * as vscode from 'vscode';
import { OverviewTreeItem } from './overview-tree-item';

export class OverviewTreeDataProvider implements vscode.TreeDataProvider<OverviewTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<OverviewTreeItem | undefined | null | void> = new vscode.EventEmitter<OverviewTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<OverviewTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor() {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: OverviewTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: OverviewTreeItem): OverviewTreeItem[] {
        if (!element) {
            // Root level - return overview items
            return this.getOverviewItems();
        }
        return [];
    }

    private getOverviewItems(): OverviewTreeItem[] {
        const now = new Date();
        const greeting = this.getGreeting();
        const dateInfo = this.getDateInfo(now);
        const wordOfTheDay = this.getWordOfTheDay();

        return [
            new OverviewTreeItem(
                `${greeting} ${dateInfo}, and the word of the day is ${wordOfTheDay}`,
                undefined,
                'comment'
            )
        ];
    }

    private getGreeting(): string {
        return "hey there! today is";
    }

    private getDateInfo(date: Date): string {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        
        const month = monthNames[date.getMonth()];
        const day = date.getDate();
        const year = date.getFullYear();
        const dayOfYear = this.getDayOfYear(date);
        
        const dayWithSuffix = this.getDayWithSuffix(day);
        
        return `${month} ${dayWithSuffix}, the ${dayOfYear} day of ${year}`;
    }

    private getDayWithSuffix(day: number): string {
        if (day >= 11 && day <= 13) {
            return `${day}th`;
        }
        switch (day % 10) {
            case 1: return `${day}st`;
            case 2: return `${day}nd`;
            case 3: return `${day}rd`;
            default: return `${day}th`;
        }
    }

    private getDayOfYear(date: Date): string {
        const start = new Date(date.getFullYear(), 0, 0);
        const diff = (date.getTime() - start.getTime()) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
        const oneDay = 1000 * 60 * 60 * 24;
        const dayOfYear = Math.floor(diff / oneDay);
        
        return this.getNumberWithSuffix(dayOfYear);
    }

    private getNumberWithSuffix(num: number): string {
        if (num >= 11 && num <= 13) {
            return `${num}th`;
        }
        switch (num % 10) {
            case 1: return `${num}st`;
            case 2: return `${num}nd`;
            case 3: return `${num}rd`;
            default: return `${num}th`;
        }
    }

    private getWordOfTheDay(): string {
        // Simple word of the day based on date for consistency
        const words = [
            "volcano", "serenity", "adventure", "harmony", "discovery", "creativity", "wonder", 
            "journey", "inspiration", "tranquility", "exploration", "imagination", "courage", 
            "wisdom", "beauty", "mystery", "freedom", "passion", "growth", "balance"
        ];
        
        const today = new Date();
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
        return words[dayOfYear % words.length];
    }
}