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

    test('Task with Active state should have blue icon', () => {
        // Arrange
        const mockTask: WorkItem = {
            id: 124,
            fields: {
                'System.Title': 'Test Active Task',
                'System.State': 'Active',
                'System.AssignedTo': { displayName: 'Test User' },
                'Microsoft.VSTS.Scheduling.RemainingWork': 3,
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
        assert.strictEqual(themeColor.id, 'charts.blue');
    });

    test('Task with Done state should have green icon', () => {
        // Arrange
        const mockTask: WorkItem = {
            id: 125,
            fields: {
                'System.Title': 'Test Done Task',
                'System.State': 'Done',
                'System.AssignedTo': { displayName: 'Test User' },
                'Microsoft.VSTS.Scheduling.RemainingWork': 0,
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
        assert.strictEqual(themeColor.id, 'charts.green');
    });

    test('Task with New state should have gray outline icon', () => {
        // Arrange
        const mockTask: WorkItem = {
            id: 126,
            fields: {
                'System.Title': 'Test New Task',
                'System.State': 'New',
                'System.AssignedTo': { displayName: 'Test User' },
                'Microsoft.VSTS.Scheduling.RemainingWork': 8,
                'System.Description': 'Test description'
            }
        };

        // Act
        const taskTreeItem = new TaskTreeItem(mockTask);

        // Assert
        assert.ok(taskTreeItem.iconPath instanceof vscode.ThemeIcon);
        const themeIcon = taskTreeItem.iconPath as vscode.ThemeIcon;
        assert.strictEqual(themeIcon.id, 'circle-outline');
        assert.ok(themeIcon.color instanceof vscode.ThemeColor);
        const themeColor = themeIcon.color as vscode.ThemeColor;
        assert.strictEqual(themeColor.id, 'charts.gray');
    });

    test('Task with Spiked state should have red icon', () => {
        // Arrange
        const mockTask: WorkItem = {
            id: 127,
            fields: {
                'System.Title': 'Test Spiked Task',
                'System.State': 'Spiked',
                'System.AssignedTo': { displayName: 'Test User' },
                'Microsoft.VSTS.Scheduling.RemainingWork': 2,
                'System.Description': 'Test spiked task description'
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