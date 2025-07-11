import * as assert from 'assert';
import * as vscode from 'vscode';
import { TasksTreeDataProvider } from '../azure/devops/tasks-tree-data-provider';
import { DevOpsService } from '../azure/devops/devops-service';
import { WorkItem } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';

suite('TasksTreeDataProvider Spiked State Filtering Test Suite', () => {
    test('filterTasksByStateGroup should exclude Spiked tasks', async () => {
        // Arrange
        const mockDevOpsService = {
            getPersonalAccessToken: async () => null,
            getOrganizationUri: async () => null,
            getProjectName: async () => null,
            getUserDisplayName: async () => null,
            getReadyTaskState: async () => 'To Do',
            getInProgressTaskState: async () => 'Doing', 
            getDoneTaskState: async () => 'Done',
            getShowRemovedTasks: async () => false
        } as DevOpsService;

        const provider = new TasksTreeDataProvider(mockDevOpsService);
        
        const mockTasks: WorkItem[] = [
            {
                id: 1,
                fields: {
                    'System.Title': 'Active Task',
                    'System.State': 'Active'
                }
            },
            {
                id: 2,
                fields: {
                    'System.Title': 'Spiked Task',
                    'System.State': 'Spiked'
                }
            },
            {
                id: 3,
                fields: {
                    'System.Title': 'Ready Task',
                    'System.State': 'To Do'
                }
            }
        ];

        // Act - Use reflection to access private method
        const filterMethod = (provider as any).filterTasksByStateGroup.bind(provider);
        const readyTasks = await filterMethod(mockTasks, 'Ready');
        const inProgressTasks = await filterMethod(mockTasks, 'In Progress');

        // Assert
        // Should have 1 ready task (the 'To Do' task), excluding the spiked task
        assert.strictEqual(readyTasks.length, 1);
        assert.strictEqual(readyTasks[0].fields?.['System.State'], 'To Do');
        
        // Should have 0 in-progress tasks (Active task would map to In Progress, but we're testing that it's properly categorized)
        // The Active task should not appear in Ready group
        assert.strictEqual(inProgressTasks.length, 1);
        assert.strictEqual(inProgressTasks[0].fields?.['System.State'], 'Active');
        
        // Most importantly, no spiked tasks should appear in any group
        const allFilteredTasks = [...readyTasks, ...inProgressTasks];
        const spikedTasks = allFilteredTasks.filter(task => task.fields?.['System.State'] === 'Spiked');
        assert.strictEqual(spikedTasks.length, 0, 'Spiked tasks should be completely excluded');
    });

    test('groupTasksByState should exclude Spiked tasks from all groups', async () => {
        // Arrange  
        const mockDevOpsService = {
            getPersonalAccessToken: async () => null,
            getOrganizationUri: async () => null,
            getProjectName: async () => null,
            getUserDisplayName: async () => null,
            getReadyTaskState: async () => 'To Do',
            getInProgressTaskState: async () => 'Doing',
            getDoneTaskState: async () => 'Done',
            getShowRemovedTasks: async () => false
        } as DevOpsService;

        const provider = new TasksTreeDataProvider(mockDevOpsService);
        
        const mockTasks: WorkItem[] = [
            {
                id: 1,
                fields: {
                    'System.Title': 'Ready Task',
                    'System.State': 'To Do'
                }
            },
            {
                id: 2,
                fields: {
                    'System.Title': 'Active Task', 
                    'System.State': 'Active'
                }
            },
            {
                id: 3,
                fields: {
                    'System.Title': 'Done Task',
                    'System.State': 'Done'
                }
            },
            {
                id: 4,
                fields: {
                    'System.Title': 'Spiked Task 1',
                    'System.State': 'Spiked'
                }
            },
            {
                id: 5,
                fields: {
                    'System.Title': 'Spiked Task 2', 
                    'System.State': 'Spiked'
                }
            }
        ];

        // Act - Use reflection to access private method
        const groupMethod = (provider as any).groupTasksByState.bind(provider);
        const stateGroups = await groupMethod(mockTasks, 1);

        // Assert
        // Should have state groups, but none should contain spiked tasks
        assert.ok(stateGroups.length > 0, 'Should have state groups for non-spiked tasks');
        
        // Verify each state group doesn't contain spiked tasks by checking task counts
        const totalTasksInGroups = stateGroups.reduce((total: number, group: any) => total + group.taskCount, 0);
        assert.strictEqual(totalTasksInGroups, 3, 'Should only count 3 non-spiked tasks (Ready, Active, Done)');
        
        // The original 5 tasks minus 2 spiked tasks should equal 3
        const expectedNonSpikedTasks = mockTasks.filter(task => task.fields?.['System.State'] !== 'Spiked').length;
        assert.strictEqual(totalTasksInGroups, expectedNonSpikedTasks);
    });

    test('groupTasksByState should exclude Spiked tasks even when showRemovedTasks is true', async () => {
        // Arrange - Testing that Spiked filtering works independently of Removed task configuration
        const mockDevOpsService = {
            getPersonalAccessToken: async () => null,
            getOrganizationUri: async () => null,
            getProjectName: async () => null,
            getUserDisplayName: async () => null,
            getReadyTaskState: async () => 'To Do',
            getInProgressTaskState: async () => 'Doing',
            getDoneTaskState: async () => 'Done',
            getShowRemovedTasks: async () => true  // Allow removed tasks but still filter spiked
        } as DevOpsService;

        const provider = new TasksTreeDataProvider(mockDevOpsService);
        
        const mockTasks: WorkItem[] = [
            {
                id: 1,
                fields: {
                    'System.Title': 'Ready Task',
                    'System.State': 'To Do'
                }
            },
            {
                id: 2,
                fields: {
                    'System.Title': 'Removed Task',
                    'System.State': 'Removed'
                }
            },
            {
                id: 3,
                fields: {
                    'System.Title': 'Spiked Task',
                    'System.State': 'Spiked'
                }
            }
        ];

        // Act
        const groupMethod = (provider as any).groupTasksByState.bind(provider);
        const stateGroups = await groupMethod(mockTasks, 1);

        // Assert
        const totalTasksInGroups = stateGroups.reduce((total: number, group: any) => total + group.taskCount, 0);
        
        // Should have 2 tasks: Ready + Removed (since showRemovedTasks is true), but NOT Spiked
        assert.strictEqual(totalTasksInGroups, 2, 'Should count Ready and Removed tasks but exclude Spiked');
    });
});