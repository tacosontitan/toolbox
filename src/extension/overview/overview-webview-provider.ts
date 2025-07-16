import * as devops from "azure-devops-node-api";
import { WebApi } from 'azure-devops-node-api/WebApi';
import { WorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';
import * as vscode from 'vscode';
import { DevOpsService } from '../services/devops-service';

export class OverviewWebviewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'overviewWebView';
    private _view?: vscode.WebviewView;
    private cycleTimeData: { average: string; count: number } | null = null;
    private cycleTimeLoaded = false;
    private recentCompletionsData: { count: number; days: number } | null = null;
    private recentCompletionsLoaded = false;
    private oldestWorkItemData: { daysAgo: number; days: number } | null = null;
    private oldestWorkItemLoaded = false;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private devOpsService?: DevOpsService
    ) {
        // Load cycle time data asynchronously
        if (this.devOpsService) {
            this.loadCycleTimeData();
            this.loadRecentCompletionsData();
            this.loadOldestWorkItemData();
        }
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage((data: any) => {
            switch (data.type) {
                case 'refresh':
                    this.refresh();
                    break;
            }
        });
    }

    public refresh() {
        if (this.devOpsService) {
            this.loadCycleTimeData();
            this.loadRecentCompletionsData();
            this.loadOldestWorkItemData();
        }
        if (this._view) {
            this._view.webview.html = this._getHtmlForWebview(this._view.webview);
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const greeting = this.getGreeting();
        const cycleTimeTile = this.getCycleTimeTileHtml();
        const recentCompletionsTile = this.getRecentCompletionsTileHtml();
        const oldestWorkItemTile = this.getOldestWorkItemTileHtml();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Overview</title>
                <style>
                    body {
                        padding: 16px;
                        color: var(--vscode-foreground);
                        background-color: var(--vscode-editor-background);
                        font-family: var(--vscode-font-family);
                        font-size: var(--vscode-font-size);
                        line-height: 1.5;
                        margin: 0;
                    }

                    .greeting {
                        margin-bottom: 20px;
                        line-height: 1.6;
                        word-wrap: break-word;
                        white-space: normal;
                    }

                    .tiles-container {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                        gap: 12px;
                    }

                    .tile {
                        background-color: var(--vscode-editor-inactiveSelectionBackground);
                        border: 1px solid var(--vscode-panel-border);
                        border-radius: 6px;
                        padding: 16px;
                        transition: background-color 0.2s ease;
                        aspect-ratio: 1;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                    }

                    .tile:hover {
                        background-color: var(--vscode-list-hoverBackground);
                    }

                    .tile-title {
                        font-weight: bold;
                        margin-bottom: 8px;
                        color: var(--vscode-foreground);
                    }

                    .tile-content {
                        color: var(--vscode-descriptionForeground);
                        font-size: 0.9em;
                    }

                    .tile-value {
                        font-size: 1.2em;
                        font-weight: bold;
                        color: var(--vscode-foreground);
                        margin-bottom: 4px;
                    }

                    .loading {
                        opacity: 0.7;
                        font-style: italic;
                    }

                    .refresh-button {
                        background: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        padding: 8px 16px;
                        border-radius: 4px;
                        cursor: pointer;
                        margin-top: 16px;
                        font-size: 0.9em;
                    }

                    .refresh-button:hover {
                        background: var(--vscode-button-hoverBackground);
                    }
                </style>
            </head>
            <body>
                <div class="greeting">${greeting}</div>
                
                <div class="tiles-container">
                    ${cycleTimeTile}
                    ${recentCompletionsTile}
                    ${oldestWorkItemTile}
                </div>

                <button class="refresh-button" onclick="refresh()">Refresh</button>

                <script>
                    const vscode = acquireVsCodeApi();
                    
                    function refresh() {
                        vscode.postMessage({ type: 'refresh' });
                    }
                </script>
            </body>
            </html>`;
    }

    private getGreeting(): string {
        const now = new Date();
        const greeting = "hey there! today is";
        const dateInfo = this.getDateInfo(now);
        const wordOfTheDay = this.getWordOfTheDay();

        return `${greeting} ${dateInfo}, and the word of the day is ${wordOfTheDay}`;
    }

    private getCycleTimeTileHtml(): string {
        if (!this.devOpsService) {
            return '';
        }

        if (!this.cycleTimeLoaded) {
            return `
                <div class="tile loading">
                    <div class="tile-title">Average Cycle Time</div>
                    <div class="tile-content">Loading...</div>
                </div>
            `;
        }

        if (!this.cycleTimeData) {
            return `
                <div class="tile">
                    <div class="tile-title">Average Cycle Time</div>
                    <div class="tile-content">No data available</div>
                </div>
            `;
        }

        return `
            <div class="tile">
                <div class="tile-title">Average Cycle Time</div>
                <div class="tile-value">${this.cycleTimeData.average} days</div>
                <div class="tile-content">Based on ${this.cycleTimeData.count} completed bugs and user stories</div>
            </div>
        `;
    }

    private getRecentCompletionsTileHtml(): string {
        if (!this.devOpsService) {
            return '';
        }

        if (!this.recentCompletionsLoaded) {
            return `
                <div class="tile loading">
                    <div class="tile-title">Recent Completions</div>
                    <div class="tile-content">Loading...</div>
                </div>
            `;
        }

        if (!this.recentCompletionsData) {
            return `
                <div class="tile">
                    <div class="tile-title">Recent Completions</div>
                    <div class="tile-content">No data available</div>
                </div>
            `;
        }

        return `
            <div class="tile">
                <div class="tile-title">Recent Completions</div>
                <div class="tile-value">${this.recentCompletionsData.count} items</div>
                <div class="tile-content">Bugs and user stories completed in the last ${this.recentCompletionsData.days} days</div>
            </div>
        `;
    }

    private getOldestWorkItemTileHtml(): string {
        if (!this.devOpsService) {
            return '';
        }

        if (!this.oldestWorkItemLoaded) {
            return `
                <div class="tile loading">
                    <div class="tile-title">Oldest Completed Item</div>
                    <div class="tile-content">Loading...</div>
                </div>
            `;
        }

        if (!this.oldestWorkItemData) {
            return `
                <div class="tile">
                    <div class="tile-title">Oldest Completed Item</div>
                    <div class="tile-content">No data available</div>
                </div>
            `;
        }

        return `
            <div class="tile">
                <div class="tile-title">Oldest Completed Item</div>
                <div class="tile-value">${this.oldestWorkItemData.daysAgo} days ago</div>
                <div class="tile-content">Oldest item closed ${this.oldestWorkItemData.days}+ days ago</div>
            </div>
        `;
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
        const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / OverviewWebviewProvider.MILLISECONDS_PER_DAY);
        return words[dayOfYear % words.length];
    }

    private async getRecentCompletionsDays(): Promise<number> {
        const config = vscode.workspace.getConfiguration('tacosontitan.toolbox');
        return config.get<number>('overview.recentCompletionsDays', 30);
    }

    private async getCycleTimeInfo(): Promise<{ average: string; count: number } | null> {
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
                return null;
            }

            const workItemIds = queryResult.workItems.map((wi: any) => wi.id!);
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
                return null;
            }

            const averageCycleTime = cycleTimes.reduce((sum, time) => sum + time, 0) / cycleTimes.length;
            const formattedAverage = averageCycleTime.toFixed(1);

            return {
                average: formattedAverage,
                count: cycleTimes.length
            };

        } catch (error) {
            // Return null to silently ignore errors and not disrupt the overview
            return null;
        }
    }

    private async loadCycleTimeData(): Promise<void> {
        this.cycleTimeLoaded = false;
        try {
            this.cycleTimeData = await this.getCycleTimeInfo();
            this.cycleTimeLoaded = true;
            if (this._view) {
                this._view.webview.html = this._getHtmlForWebview(this._view.webview);
            }
        } catch (error) {
            // Silently ignore errors
            this.cycleTimeLoaded = true;
            if (this._view) {
                this._view.webview.html = this._getHtmlForWebview(this._view.webview);
            }
        }
    }

    private async loadRecentCompletionsData(): Promise<void> {
        this.recentCompletionsLoaded = false;
        try {
            this.recentCompletionsData = await this.getRecentCompletionsInfo();
            this.recentCompletionsLoaded = true;
            if (this._view) {
                this._view.webview.html = this._getHtmlForWebview(this._view.webview);
            }
        } catch (error) {
            // Silently ignore errors
            this.recentCompletionsLoaded = true;
            if (this._view) {
                this._view.webview.html = this._getHtmlForWebview(this._view.webview);
            }
        }
    }

    private async loadOldestWorkItemData(): Promise<void> {
        this.oldestWorkItemLoaded = false;
        try {
            this.oldestWorkItemData = await this.getOldestWorkItemInfo();
            this.oldestWorkItemLoaded = true;
            if (this._view) {
                this._view.webview.html = this._getHtmlForWebview(this._view.webview);
            }
        } catch (error) {
            // Silently ignore errors
            this.oldestWorkItemLoaded = true;
            if (this._view) {
                this._view.webview.html = this._getHtmlForWebview(this._view.webview);
            }
        }
    }

    private async getRecentCompletionsInfo(): Promise<{ count: number; days: number } | null> {
        if (!this.devOpsService) {
            return null;
        }

        try {
            const personalAccessToken = await this.devOpsService.getPersonalAccessToken();
            const organizationUri = await this.devOpsService.getOrganizationUri();
            const projectName = await this.devOpsService.getProjectName();
            const userDisplayName = await this.devOpsService.getUserDisplayName();
            const days = await this.getRecentCompletionsDays();

            if (!personalAccessToken || !organizationUri || !projectName || !userDisplayName) {
                return null;
            }

            const authenticationHandler = devops.getPersonalAccessTokenHandler(personalAccessToken);
            const connection = new WebApi(organizationUri, authenticationHandler);
            const workItemTrackingClient: WorkItemTrackingApi = await connection.getWorkItemTrackingApi();

            // Calculate the date N days ago
            const nDaysAgo = new Date();
            nDaysAgo.setDate(nDaysAgo.getDate() - days);
            const nDaysAgoISOString = nDaysAgo.toISOString();

            // Query for completed bugs and user stories assigned to the user in the last N days
            const wiql = {
                query: `SELECT [System.Id], [System.WorkItemType], [Microsoft.VSTS.Common.ClosedDate] 
                        FROM WorkItems 
                        WHERE [System.AssignedTo] = '${userDisplayName}' 
                        AND [System.WorkItemType] IN ('Bug', 'User Story') 
                        AND [System.State] IN ('Closed', 'Done', 'Resolved') 
                        AND [Microsoft.VSTS.Common.ClosedDate] >= '${nDaysAgoISOString}'
                        ORDER BY [Microsoft.VSTS.Common.ClosedDate] DESC`
            };

            const queryResult = await workItemTrackingClient.queryByWiql(wiql, { project: projectName });

            const count = queryResult.workItems ? queryResult.workItems.length : 0;

            return {
                count: count,
                days: days
            };

        } catch (error) {
            // Return null to silently ignore errors and not disrupt the overview
            return null;
        }
    }

    private async getOldestWorkItemInfo(): Promise<{ daysAgo: number; days: number } | null> {
        if (!this.devOpsService) {
            return null;
        }

        try {
            const personalAccessToken = await this.devOpsService.getPersonalAccessToken();
            const organizationUri = await this.devOpsService.getOrganizationUri();
            const projectName = await this.devOpsService.getProjectName();
            const userDisplayName = await this.devOpsService.getUserDisplayName();
            const days = await this.getRecentCompletionsDays();

            if (!personalAccessToken || !organizationUri || !projectName || !userDisplayName) {
                return null;
            }

            const authenticationHandler = devops.getPersonalAccessTokenHandler(personalAccessToken);
            const connection = new WebApi(organizationUri, authenticationHandler);
            const workItemTrackingClient: WorkItemTrackingApi = await connection.getWorkItemTrackingApi();

            // Calculate the date N days ago
            const nDaysAgo = new Date();
            nDaysAgo.setDate(nDaysAgo.getDate() - days);
            const nDaysAgoISOString = nDaysAgo.toISOString();

            // Query for completed bugs and user stories assigned to the user that were closed N or more days ago
            const wiql = {
                query: `SELECT [System.Id], [System.WorkItemType], [Microsoft.VSTS.Common.ClosedDate] 
                        FROM WorkItems 
                        WHERE [System.AssignedTo] = '${userDisplayName}' 
                        AND [System.WorkItemType] IN ('Bug', 'User Story') 
                        AND [System.State] IN ('Closed', 'Done', 'Resolved') 
                        AND [Microsoft.VSTS.Common.ClosedDate] <= '${nDaysAgoISOString}'
                        ORDER BY [Microsoft.VSTS.Common.ClosedDate] ASC`
            };

            const queryResult = await workItemTrackingClient.queryByWiql(wiql, { project: projectName });

            if (!queryResult.workItems || queryResult.workItems.length === 0) {
                return null;
            }

            // Get the oldest work item (first in the ascending order)
            const workItemIds = [queryResult.workItems[0].id!];
            const workItems = await workItemTrackingClient.getWorkItems(
                workItemIds,
                ['System.Id', 'System.WorkItemType', 'Microsoft.VSTS.Common.ClosedDate'],
                undefined,
                undefined,
                undefined,
                projectName
            );

            if (workItems.length === 0) {
                return null;
            }

            const closedDate = workItems[0].fields?.['Microsoft.VSTS.Common.ClosedDate'];
            if (!closedDate) {
                return null;
            }

            const closed = new Date(closedDate);
            const now = new Date();
            const daysAgo = Math.floor((now.getTime() - closed.getTime()) / (1000 * 60 * 60 * 24));

            return {
                daysAgo: daysAgo,
                days: days
            };

        } catch (error) {
            // Return null to silently ignore errors and not disrupt the overview
            return null;
        }
    }
}