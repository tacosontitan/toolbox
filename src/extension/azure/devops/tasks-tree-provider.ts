import * as vscode from 'vscode';
import * as devops from "azure-devops-node-api";
import { WebApi } from 'azure-devops-node-api/WebApi';
import { WorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';
import { WorkItem } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import { ConfigurationManager } from '../../configuration-manager';
import { IAssistant } from '../../assistant';

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

export class PlaceholderTreeItem extends vscode.TreeItem {
    constructor(label: string, description: string, iconName: string = 'info') {
        super(label, vscode.TreeItemCollapsibleState.None);
        this.description = description;
        this.contextValue = 'placeholder';
        this.iconPath = new vscode.ThemeIcon(iconName);
    }
}

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
        this.contextValue = 'task';
        
        // Set icon based on task state
        if (state === 'Done' || state === 'Closed') {
            this.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('charts.green'));
        } else if (state === 'Active' || state === 'In Progress') {
            this.iconPath = new vscode.ThemeIcon('play', new vscode.ThemeColor('charts.blue'));
        } else if (state === 'New' || state === 'To Do') {
            this.iconPath = new vscode.ThemeIcon('circle-outline', new vscode.ThemeColor('charts.gray'));
        } else {
            this.iconPath = new vscode.ThemeIcon('question', new vscode.ThemeColor('charts.yellow'));
        }
    }
}

export class TasksTreeDataProvider implements vscode.TreeDataProvider<WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem | undefined | null | void> = new vscode.EventEmitter<WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private workItemNumber: number | undefined;
    private workItem: WorkItem | undefined;
    private tasks: WorkItem[] = [];

    constructor(private assistant: IAssistant) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    async setWorkItem(workItemNumber: number): Promise<void> {
        this.workItemNumber = workItemNumber;
        
        // Show loading state
        this.workItem = {
            id: workItemNumber,
            fields: {
                'System.Title': 'Loading...',
                'System.WorkItemType': '',
                'System.State': ''
            }
        } as WorkItem;
        this.tasks = [];
        this.refresh();
        
        await this.loadWorkItemAndTasks();
        this.refresh();
    }

    getTreeItem(element: WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem): Promise<(WorkItemTreeItem | TaskTreeItem | PlaceholderTreeItem)[]> {
        if (!element) {
            // Root level - show the work item if one is set
            if (this.workItem) {
                return [new WorkItemTreeItem(this.workItem, vscode.TreeItemCollapsibleState.Expanded)];
            } else {
                // Show a placeholder item when no work item is set
                return [new PlaceholderTreeItem("No work item selected", "Use the search icon to set a work item", 'info')];
            }
        }

        if (element instanceof WorkItemTreeItem) {
            // Show tasks under the work item
            if (this.tasks.length === 0) {
                return [new PlaceholderTreeItem("No tasks found", "This work item has no child tasks", 'info')];
            }
            return this.tasks.map(task => new TaskTreeItem(task));
        }

        return [];
    }

    private async loadWorkItemAndTasks(): Promise<void> {
        if (!this.workItemNumber) {
            return;
        }

        try {
            const personalAccessToken = await this.getPersonalAccessToken();
            const organizationUri = this.getOrganizationUri();
            const projectName = this.getProjectName();

            if (!personalAccessToken || !organizationUri || !projectName) {
                vscode.window.showErrorMessage('Azure DevOps configuration is incomplete. Please check your settings.');
                return;
            }

            const authenticationHandler = devops.getPersonalAccessTokenHandler(personalAccessToken);
            const connection = new WebApi(organizationUri, authenticationHandler);
            const workItemTrackingClient: WorkItemTrackingApi = await connection.getWorkItemTrackingApi();

            // Get the main work item
            this.workItem = await workItemTrackingClient.getWorkItem(this.workItemNumber);

            // Get child tasks using a WIQL query
            const wiql = {
                query: `SELECT [System.Id] FROM WorkItems WHERE [System.Parent] = ${this.workItemNumber} AND [System.WorkItemType] = 'Task' ORDER BY [System.Id]`
            };

            const queryResult = await workItemTrackingClient.queryByWiql(wiql);
            
            if (queryResult.workItems && queryResult.workItems.length > 0) {
                const taskIds = queryResult.workItems.map(wi => wi.id!);
                this.tasks = await workItemTrackingClient.getWorkItems(taskIds, undefined, undefined, undefined, undefined, projectName);
            } else {
                this.tasks = [];
            }

        } catch (error) {
            const errorMessage = (error as Error).message;
            if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
                vscode.window.showErrorMessage('Authentication failed. Please check your personal access token.');
            } else if (errorMessage.includes('404') || errorMessage.includes('Not Found')) {
                vscode.window.showErrorMessage(`Work item #${this.workItemNumber} not found. Please check the work item number.`);
            } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
                vscode.window.showErrorMessage('Network error. Please check your connection and try again.');
            } else {
                vscode.window.showErrorMessage(`Failed to load work item and tasks: ${errorMessage}`);
            }
            this.workItem = undefined;
            this.tasks = [];
        }
    }

    private async getPersonalAccessToken(): Promise<string | null> {
        const personalAccessTokenSecretId = "tacosontitan.toolbox.azure.devops.personalAccessToken";
        let personalAccessToken = await this.assistant.extensionContext.secrets.get(personalAccessTokenSecretId);
        let tokenIsValid = await this.determineIfPersonalAccessTokenIsValid(personalAccessToken);
        if (personalAccessToken && tokenIsValid) {
            return personalAccessToken;
        }

        personalAccessToken = await vscode.window.showInputBox({
            prompt: "🙏 Please provide your personal access token for Azure DevOps.",
            password: true
        });

        tokenIsValid = await this.determineIfPersonalAccessTokenIsValid(personalAccessToken);
        if (!personalAccessToken || !tokenIsValid) {
            return null;
        }

        await this.assistant.extensionContext.secrets.store(personalAccessTokenSecretId, personalAccessToken);
        return personalAccessToken;
    }

    private getProjectName(): string | null {
        const projectName = ConfigurationManager.get<string | null>("azure.devops.project");
        if (!projectName) {
            vscode.window.showErrorMessage("Azure DevOps project is not configured. Commands that require it will not work.");
            return null;
        }
        return projectName;
    }

    private getOrganizationUri(): string | null {
        const organization = ConfigurationManager.get<string | null>("azure.devops.organization");
        if (!organization) {
            vscode.window.showErrorMessage("Azure DevOps organization is not configured. Commands that require it will not work.");
            return null;
        }

        const useClassicUri = ConfigurationManager.get<boolean>("azure.devops.useClassicUri");
        if (useClassicUri) {
            return `https://${organization}.visualstudio.com`;
        }
        return `https://dev.azure.com/${organization}`;
    }

    private async determineIfPersonalAccessTokenIsValid(token: string | null | undefined): Promise<boolean> {
        try {
            if (!token) {
                return false;
            }

            const organizationUri = this.getOrganizationUri();
            if (!organizationUri) {
                return false;
            }

            const authenticationHandler = devops.getPersonalAccessTokenHandler(token);
            const connection = new devops.WebApi(organizationUri, authenticationHandler);
            const workItemApi = await connection.getWorkItemTrackingApi();
            await workItemApi.getWorkItems([1]);
            return true;
        } catch (error: any) {
            if (error.statusCode === 401) {
                return false;
            }
            return false;
        }
    }
}