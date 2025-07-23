import * as assert from 'assert';
import { TasksTreeDataProvider } from '../application/providers/tasks-tree-data-provider';
import { DevOpsService } from '../infrastructure/azure/devops-service';

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

    async getShowInactiveTasks(): Promise<boolean> {
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

    test('mapTaskStateToGroup should correctly map task states', () => {
        // This tests the state mapping logic
        const readyState = 'To Do';
        const inProgressState = 'Doing';
        const doneState = 'Done';

        // Use a method to test the private mapTaskStateToGroup method indirectly
        // by checking the behavior through the state grouping
        const result1 = (provider as any).mapTaskStateToGroup('To Do', readyState, inProgressState, doneState);
        assert.strictEqual(result1, 'Ready');

        const result2 = (provider as any).mapTaskStateToGroup('Doing', readyState, inProgressState, doneState);
        assert.strictEqual(result2, 'In Progress');

        const result3 = (provider as any).mapTaskStateToGroup('Done', readyState, inProgressState, doneState);
        assert.strictEqual(result3, 'Closed');

        const result4 = (provider as any).mapTaskStateToGroup('Removed', readyState, inProgressState, doneState);
        assert.strictEqual(result4, 'Removed');
    });
});