import * as assert from 'assert';
import * as vscode from 'vscode';
import { TasksTreeDataProvider } from '../azure/devops/tasks-tree-data-provider';
import { DevOpsService } from '../azure/devops/devops-service';
import { TaskTreeItem } from '../azure/devops/task-tree-item';
import { StateGroupTreeItem } from '../azure/devops/state-group-tree-item';
import { WorkItem } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';

// Mock the DevOpsService
class MockDevOpsService extends DevOpsService {
    constructor() {
        super({} as any, {} as any);
    }

    async getPersonalAccessToken(): Promise<string> {
        return 'mock-token';
    }

    async getOrganizationUri(): Promise<string> {
        return 'https://dev.azure.com/mock-org';
    }

    async getProjectName(): Promise<string> {
        return 'MockProject';
    }

    async getUserDisplayName(): Promise<string> {
        return 'Mock User';
    }

    async getReadyTaskState(): Promise<string> {
        return 'To Do';
    }

    async getInProgressTaskState(): Promise<string> {
        return 'Doing';
    }

    async getDoneTaskState(): Promise<string> {
        return 'Done';
    }

    async getShowRemovedTasks(): Promise<boolean> {
        return false;
    }
}

suite('TasksTreeDataProvider Test Suite', () => {
    let provider: TasksTreeDataProvider;
    let mockDevOpsService: MockDevOpsService;

    setup(() => {
        mockDevOpsService = new MockDevOpsService();
        provider = new TasksTreeDataProvider(mockDevOpsService);
    });

    test('Drag and drop properties should be configured correctly', () => {
        assert.deepStrictEqual(provider.dropMimeTypes, ['application/vnd.code.tree.taskstreeview']);
        assert.deepStrictEqual(provider.dragMimeTypes, ['application/vnd.code.tree.taskstreeview']);
    });

    test('handleDrag should only allow task items to be dragged', async () => {
        // Arrange
        const mockTask: WorkItem = {
            id: 123,
            fields: {
                'System.Title': 'Test Task',
                'System.State': 'To Do'
            }
        };

        const taskItem = new TaskTreeItem(mockTask);
        const stateGroup = new StateGroupTreeItem('To Do', 1);
        const treeDataTransfer = new vscode.DataTransfer();

        // Act - try to drag mixed items
        await provider.handleDrag([taskItem, stateGroup], treeDataTransfer, {} as vscode.CancellationToken);

        // Assert - only task items should be in the transfer
        const transferItem = treeDataTransfer.get('application/vnd.code.tree.taskstreeview');
        assert.ok(transferItem);
        const tasks = transferItem.value as TaskTreeItem[];
        assert.strictEqual(tasks.length, 1);
        assert.strictEqual(tasks[0].task.id, 123);
    });

    test('handleDrag should not set transfer data for non-task items', async () => {
        // Arrange
        const stateGroup = new StateGroupTreeItem('To Do', 1);
        const treeDataTransfer = new vscode.DataTransfer();

        // Act
        await provider.handleDrag([stateGroup], treeDataTransfer, {} as vscode.CancellationToken);

        // Assert
        const transferItem = treeDataTransfer.get('application/vnd.code.tree.taskstreeview');
        assert.strictEqual(transferItem, undefined);
    });
});