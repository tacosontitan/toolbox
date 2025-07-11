import * as vscode from 'vscode';
import * as devops from "azure-devops-node-api";
import { WebApi } from 'azure-devops-node-api/WebApi';
import { WorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';
import { WorkItem } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import { OverviewTreeItem } from './overview-tree-item';
import { DevOpsService } from '../azure/devops/devops-service';

export class OverviewTreeDataProvider implements vscode.TreeDataProvider<OverviewTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<OverviewTreeItem | undefined | null | void> = new vscode.EventEmitter<OverviewTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<OverviewTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;
    private cycleTimeItem: OverviewTreeItem | null = null;
    private cycleTimeLoaded = false;

    constructor(private devOpsService?: DevOpsService) {
        // Load cycle time data asynchronously
        if (this.devOpsService) {
            this.loadCycleTimeData();
        }
    }

    refresh(): void {
        // Reload cycle time data when refreshing
        if (this.devOpsService) {
            this.loadCycleTimeData();
        }
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

        const items = [
            new OverviewTreeItem(
                `${greeting} ${dateInfo}, and the word of the day is ${wordOfTheDay}`,
                undefined,
                'comment'
            )
        ];

        // Add cycle time information if available
        if (this.cycleTimeItem) {
            items.push(this.cycleTimeItem);
        } else if (this.devOpsService && !this.cycleTimeLoaded) {
            // Show loading state
            items.push(new OverviewTreeItem(
                "Loading cycle time data...",
                undefined,
                'sync~spin'
            ));
        }

        return items;
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

    private async getCycleTimeInfo(): Promise<OverviewTreeItem | null> {
        if (!this.devOpsService) {
            return null;
        }

        try {
            const personalAccessToken = await this.devOpsService.getPersonalAccessToken();
            const organizationUri = await this.devOpsService.getOrganizationUri();
            const projectName = await this.devOpsService.getProjectName();
            const userDisplayName = await this.devOpsService.getUserDisplayName();

            if (!personalAccessToken || !organizationUri || !projectName || !userDisplayName) {
                return null;
            }

            const authenticationHandler = devops.getPersonalAccessTokenHandler(personalAccessToken);
            const connection = new WebApi(organizationUri, authenticationHandler);
            const workItemTrackingClient: WorkItemTrackingApi = await connection.getWorkItemTrackingApi();

            // Query for completed bugs and user stories assigned to the user
            const wiql = {
                query: `SELECT [System.Id], [System.WorkItemType], [System.ActivatedDate], [Microsoft.VSTS.Common.ClosedDate] 
                        FROM WorkItems 
                        WHERE [System.AssignedTo] = '${userDisplayName}' 
                        AND [System.WorkItemType] IN ('Bug', 'User Story') 
                        AND [System.State] IN ('Closed', 'Done', 'Resolved') 
                        AND [System.ActivatedDate] <> '' 
                        AND [Microsoft.VSTS.Common.ClosedDate] <> ''
                        ORDER BY [System.Id]`
            };

            const queryResult = await workItemTrackingClient.queryByWiql(wiql, { project: projectName });
            
            if (!queryResult.workItems || queryResult.workItems.length === 0) {
                return new OverviewTreeItem(
                    "No completed work items found for cycle time calculation",
                    undefined,
                    'info'
                );
            }

            const workItemIds = queryResult.workItems.map(wi => wi.id!);
            const workItems = await workItemTrackingClient.getWorkItems(
                workItemIds, 
                ['System.Id', 'System.WorkItemType', 'System.ActivatedDate', 'Microsoft.VSTS.Common.ClosedDate'],
                undefined, 
                undefined, 
                undefined, 
                projectName
            );

            const cycleTimes: number[] = [];
            
            for (const workItem of workItems) {
                const activatedDate = workItem.fields?.['System.ActivatedDate'];
                const closedDate = workItem.fields?.['Microsoft.VSTS.Common.ClosedDate'];
                
                if (activatedDate && closedDate) {
                    const activated = new Date(activatedDate);
                    const closed = new Date(closedDate);
                    const cycleTimeMs = closed.getTime() - activated.getTime();
                    const cycleTimeDays = cycleTimeMs / (1000 * 60 * 60 * 24);
                    
                    if (cycleTimeDays > 0) {
                        cycleTimes.push(cycleTimeDays);
                    }
                }
            }

            if (cycleTimes.length === 0) {
                return new OverviewTreeItem(
                    "No valid cycle times found",
                    undefined,
                    'info'
                );
            }

            const averageCycleTime = cycleTimes.reduce((sum, time) => sum + time, 0) / cycleTimes.length;
            const formattedAverage = averageCycleTime.toFixed(1);
            
            return new OverviewTreeItem(
                `Average cycle time: ${formattedAverage} days`,
                `Based on ${cycleTimes.length} completed bugs and user stories`,
                'graph'
            );

        } catch (error) {
            // Return null to silently ignore errors and not disrupt the overview
            return null;
        }
    }

    private async loadCycleTimeData(): Promise<void> {
        this.cycleTimeLoaded = false;
        try {
            this.cycleTimeItem = await this.getCycleTimeInfo();
            this.cycleTimeLoaded = true;
            this._onDidChangeTreeData.fire();
        } catch (error) {
            // Silently ignore errors
            this.cycleTimeLoaded = true;
            this._onDidChangeTreeData.fire();
        }
    }
}