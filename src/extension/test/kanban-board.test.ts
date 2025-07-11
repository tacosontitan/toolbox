import * as assert from 'assert';
import { WorkItem } from '../core/workflow/work-item';
import { WorkItemState } from '../core/workflow/work-item-state';

/**
 * Test suite for Kanban Board functionality
 */
suite('Kanban Board Tests', () => {
    test('WorkItem should have correct state transitions', () => {
        const workItem = new WorkItem(
            'Test Task',
            'A test task for the kanban board',
            4,
            'Development'
        );
        
        workItem.state = WorkItemState.New;
        assert.strictEqual(workItem.state.name, 'New');
        
        workItem.state = new WorkItemState('Active');
        assert.strictEqual(workItem.state.name, 'Active');
        
        workItem.state = new WorkItemState('Closed');
        assert.strictEqual(workItem.state.name, 'Closed');
    });

    test('WorkItem should maintain properties correctly', () => {
        const workItem = new WorkItem(
            'Test Task',
            'A test task description',
            8,
            'Testing'
        );
        
        workItem.id = 12345;
        workItem.type = { name: 'Task' };
        
        assert.strictEqual(workItem.id, 12345);
        assert.strictEqual(workItem.title, 'Test Task');
        assert.strictEqual(workItem.description, 'A test task description');
        assert.strictEqual(workItem.remainingWork, 8);
        assert.strictEqual(workItem.activity, 'Testing');
        assert.strictEqual(workItem.type.name, 'Task');
    });

    test('WorkItemState should handle different states', () => {
        const newState = new WorkItemState('New');
        const activeState = new WorkItemState('Active');
        const closedState = new WorkItemState('Closed');
        
        assert.strictEqual(newState.name, 'New');
        assert.strictEqual(activeState.name, 'Active');
        assert.strictEqual(closedState.name, 'Closed');
    });
});