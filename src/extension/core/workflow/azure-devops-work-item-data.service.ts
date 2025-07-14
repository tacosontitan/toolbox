import * as devops from "azure-devops-node-api";
import { WebApi } from 'azure-devops-node-api/WebApi';
import { WorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';
import { WorkItem } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';
import { IWorkItemDataService, TaskStateGroup } from './work-item-data.service.interface';
import { DevOpsService } from '../../azure/devops/devops-service';

/**
 * Azure DevOps implementation of work item data service.
 * Handles data operations separate from UI concerns.
 */
export class AzureDevOpsWorkItemDataService implements IWorkItemDataService {
    constructor(private readonly devOpsService: DevOpsService) {}

    async loadActiveWorkItems(): Promise<WorkItem[]> {
        try {
            const workItemTrackingClient = await this.getWorkItemTrackingClient();
            if (!workItemTrackingClient) {
                return [];
            }

            const userDisplayName = await this.devOpsService.getUserDisplayName();
            if (!userDisplayName) {
                return [];
            }

            const projectName = await this.devOpsService.getProjectName();
            if (!projectName) {
                return [];
            }

            // Query for active work items assigned to the user
            const wiql = {
                query: `SELECT [System.Id], [System.Title], [System.State], [System.WorkItemType] 
                       FROM WorkItems 
                       WHERE [System.AssignedTo] = '${userDisplayName}' 
                       AND [System.WorkItemType] IN ('Bug', 'User Story', 'Feature') 
                       AND [System.State] <> 'Closed' 
                       AND [System.State] <> 'Removed' 
                       ORDER BY [System.ChangedDate] DESC`
            };

            const queryResult = await workItemTrackingClient.queryByWiql(wiql, { project: projectName });
            
            if (!queryResult.workItems || queryResult.workItems.length === 0) {
                return [];
            }

            const workItemIds = queryResult.workItems.map(wi => wi.id!);
            const workItems = await workItemTrackingClient.getWorkItems(workItemIds, undefined, undefined, undefined, undefined, projectName);
            
            return workItems || [];
        } catch (error) {
            console.error('Failed to load active work items:', error);
            return [];
        }
    }

    async loadTasksForWorkItem(workItemId: number): Promise<WorkItem[]> {
        try {
            const workItemTrackingClient = await this.getWorkItemTrackingClient();
            if (!workItemTrackingClient) {
                return [];
            }

            const projectName = await this.devOpsService.getProjectName();
            if (!projectName) {
                return [];
            }

            // Query for tasks related to the work item
            const wiql = {
                query: `SELECT [System.Id], [System.Title], [System.State], [System.WorkItemType] 
                       FROM WorkItemLinks 
                       WHERE ([Source].[System.Id] = ${workItemId}) 
                       AND ([System.Links.LinkType] = 'System.LinkTypes.Hierarchy-Forward') 
                       AND ([Target].[System.WorkItemType] = 'Task') 
                       ORDER BY [Target].[System.Id]`
            };

            const queryResult = await workItemTrackingClient.queryByWiql(wiql, { project: projectName });
            
            if (!queryResult.workItemRelations || queryResult.workItemRelations.length === 0) {
                return [];
            }

            const taskIds = queryResult.workItemRelations
                .filter(rel => rel.target && rel.target.id)
                .map(rel => rel.target!.id!);

            if (taskIds.length === 0) {
                return [];
            }

            const tasks = await workItemTrackingClient.getWorkItems(taskIds, undefined, undefined, undefined, undefined, projectName);
            return tasks || [];
        } catch (error) {
            console.error(`Failed to load tasks for work item ${workItemId}:`, error);
            return [];
        }
    }

    async groupTasksByState(tasks: WorkItem[]): Promise<TaskStateGroup[]> {
        const readyState = await this.devOpsService.getReadyTaskState();
        const inProgressState = await this.devOpsService.getInProgressTaskState();
        const doneState = await this.devOpsService.getDoneTaskState();
        const showRemovedTasks = await this.devOpsService.getShowRemovedTasks();

        // Filter out removed tasks if configured to not show them
        const filteredTasks = showRemovedTasks 
            ? tasks 
            : tasks.filter(task => task.fields?.['System.State'] !== 'Removed');

        // Group tasks by their mapped state categories
        const groups: { [key: string]: WorkItem[] } = {};
        
        for (const task of filteredTasks) {
            const taskState = task.fields?.['System.State'];
            const mappedState = this.mapTaskStateToGroup(taskState, readyState, inProgressState, doneState);
            
            if (!groups[mappedState]) {
                groups[mappedState] = [];
            }
            groups[mappedState].push(task);
        }

        // Create state group objects in the requested order
        const stateOrder = ['In Progress', 'Ready', 'Closed', 'Removed'];
        const stateGroups: TaskStateGroup[] = [];

        for (const stateName of stateOrder) {
            const tasksInState = groups[stateName];
            if (tasksInState && tasksInState.length > 0) {
                // Skip "Removed" if configured to not show
                if (stateName === 'Removed' && !showRemovedTasks) {
                    continue;
                }
                stateGroups.push({
                    stateName,
                    tasks: tasksInState,
                    taskCount: tasksInState.length
                });
            }
        }

        return stateGroups;
    }

    async filterTasksByStateGroup(tasks: WorkItem[], stateName: string): Promise<WorkItem[]> {
        const readyState = await this.devOpsService.getReadyTaskState();
        const inProgressState = await this.devOpsService.getInProgressTaskState();
        const doneState = await this.devOpsService.getDoneTaskState();
        const showRemovedTasks = await this.devOpsService.getShowRemovedTasks();

        return tasks.filter(task => {
            const taskState = task.fields?.['System.State'];
            
            // Filter out removed tasks if configured to not show them
            if (!showRemovedTasks && taskState === 'Removed') {
                return false;
            }
            
            const mappedState = this.mapTaskStateToGroup(taskState, readyState, inProgressState, doneState);
            return mappedState === stateName;
        });
    }

    private async getWorkItemTrackingClient(): Promise<WorkItemTrackingApi | null> {
        try {
            const personalAccessToken = await this.devOpsService.getPersonalAccessToken();
            if (!personalAccessToken) {
                return null;
            }

            const organizationUri = await this.devOpsService.getOrganizationUri();
            if (!organizationUri) {
                return null;
            }

            const authHandler = devops.getPersonalAccessTokenHandler(personalAccessToken);
            const connection = new WebApi(organizationUri, authHandler);
            return await connection.getWorkItemTrackingApi();
        } catch (error) {
            console.error('Failed to get work item tracking client:', error);
            return null;
        }
    }

    private mapTaskStateToGroup(taskState: string, readyState: string, inProgressState: string, doneState: string): string {
        if (!taskState) {
            return 'Ready'; // Default for undefined states
        }

        // Map configured states to groups
        if (taskState === inProgressState || taskState === 'Active' || taskState === 'Doing' || taskState === 'In Progress') {
            return 'In Progress';
        }
        
        if (taskState === readyState || taskState === 'New' || taskState === 'To Do' || taskState === 'Ready') {
            return 'Ready';
        }
        
        if (taskState === doneState || taskState === 'Done' || taskState === 'Completed' || taskState === 'Closed' || taskState === 'Resolved') {
            return 'Closed';
        }
        
        if (taskState === 'Removed') {
            return 'Removed';
        }

        // Default mapping for unknown states
        return 'Ready';
    }
}