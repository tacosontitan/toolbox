import * as assert from 'assert';
import * as vscode from 'vscode';
import { TaskTreeItem } from '../azure/devops/task-tree-item';
import { WorkItem } from 'azure-devops-node-api/interfaces/WorkItemTrackingInterfaces';

suite('TaskTreeItem Test Suite', () => {
    test('Task with Removed state should have red icon', () => {
        // Arrange
        const mockTask: WorkItem = {
            id: 123,
            fields: {
                'System.Title': 'Test Task',
                'System.State': 'Removed',
                'System.AssignedTo': { displayName: 'Test User' },
                'Microsoft.VSTS.Scheduling.RemainingWork': 5,
                'System.Description': 'Test description'
            }
        };

        // Act
        const taskTreeItem = new TaskTreeItem(mockTask);

        // Assert
        assert.ok(taskTreeItem.iconPath instanceof vscode.ThemeIcon);
        const themeIcon = taskTreeItem.iconPath as vscode.ThemeIcon;
        assert.strictEqual(themeIcon.id, 'circle-filled');
        assert.ok(themeIcon.color instanceof vscode.ThemeColor);
        const themeColor = themeIcon.color as vscode.ThemeColor;
        assert.strictEqual(themeColor.id, 'charts.red');
    });
});