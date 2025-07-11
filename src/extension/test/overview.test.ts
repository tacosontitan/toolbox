import * as assert from 'assert';
import { OverviewTreeDataProvider } from '../overview/overview-tree-data-provider';

suite('Overview Test Suite', () => {
    test('OverviewTreeDataProvider should return overview items without DevOps service', () => {
        const provider = new OverviewTreeDataProvider();
        const children = provider.getChildren();
        
        assert.strictEqual(children.length, 1);
        assert.ok(children[0].label.includes('hey there! today is'));
        assert.ok(children[0].label.includes('day of'));
        assert.ok(children[0].label.includes('and the word of the day is'));
    });

    test('Overview item should have greeting format', () => {
        const provider = new OverviewTreeDataProvider();
        const children = provider.getChildren();
        const overviewText = children[0].label;
        
        // Check that it follows the expected format
        const regex = /hey there! today is \w+ \d+\w+, the \d+\w+ day of \d+, and the word of the day is \w+/;
        assert.ok(regex.test(overviewText), `Overview text "${overviewText}" does not match expected format`);
    });
});