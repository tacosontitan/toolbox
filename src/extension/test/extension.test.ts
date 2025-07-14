import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { TasksTreeDataProvider } from '../azure/devops/tasks-tree-data-provider';
import { IWorkItemDataService } from '../core/workflow/work-item-data.service.interface';
import { PlaceholderTreeItem } from '../azure/devops/placeholder-tree-item';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('TasksTreeDataProvider shows placeholder when no work items', async () => {
		// Create a mock IWorkItemDataService that returns empty results
		const mockDataService: IWorkItemDataService = {
			loadActiveWorkItems: async () => [],
			loadTasksForWorkItem: async () => [],
			groupTasksByState: async () => [],
			filterTasksByStateGroup: async () => []
		};

		const provider = new TasksTreeDataProvider(mockDataService);
		
		// Since the provider loads data asynchronously in constructor, wait a bit
		await new Promise(resolve => setTimeout(resolve, 100));
		
		const children = await provider.getChildren();
		assert.strictEqual(children.length, 1);
		assert.ok(children[0] instanceof PlaceholderTreeItem);
		assert.strictEqual((children[0] as PlaceholderTreeItem).label, 'No active work items');
	});
});
