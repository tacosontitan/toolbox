import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { PlaceholderTreeItem } from '../core/placeholder-tree-item';
import { TasksTreeDataProvider } from '../todo/providers/tasks-tree-data-provider';
import { DevOpsService } from '../todo/services/devops-service';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('TasksTreeDataProvider shows placeholder when no work items', async () => {
		// Create a mock DevOpsService that returns empty/invalid configuration
		const mockDevOpsService = {
			getPersonalAccessToken: async () => null,
			getOrganizationUri: async () => null,
			getProjectName: async () => null,
			getUserDisplayName: async () => null
		} as DevOpsService;

		const provider = new TasksTreeDataProvider(mockDevOpsService);
		
		// Since the provider loads data asynchronously in constructor, wait a bit
		await new Promise(resolve => setTimeout(resolve, 100));
		
		const children = await provider.getChildren();
		assert.strictEqual(children.length, 1);
		assert.ok(children[0] instanceof PlaceholderTreeItem);
		assert.strictEqual((children[0] as PlaceholderTreeItem).label, 'No active work items');
	});
});
