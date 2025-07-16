import * as assert from 'assert';
import { TimeEntry, TimeEntryUtils } from '../domain/time/time-entry';

suite('Time Entry Utils Tests', () => {
    test('Should format date correctly', () => {
        const date = new Date('2025-01-10T08:30:00');
        const formatted = TimeEntryUtils.formatDate(date);
        assert.strictEqual(formatted, '2025-01-10');
    });

    test('Should format time correctly', () => {
        const date = new Date('2025-01-10T07:55:00');
        const formatted = TimeEntryUtils.formatTime(date);
        assert.strictEqual(formatted, '0755');
    });

    test('Should calculate day total correctly', () => {
        const entries: TimeEntry[] = [
            {
                id: '1',
                type: 'clock-in',
                timestamp: new Date('2025-01-10T08:00:00')
            },
            {
                id: '2',
                type: 'clock-out',
                timestamp: new Date('2025-01-10T12:00:00')
            },
            {
                id: '3',
                type: 'clock-in',
                timestamp: new Date('2025-01-10T13:00:00')
            },
            {
                id: '4',
                type: 'clock-out',
                timestamp: new Date('2025-01-10T17:15:00')
            }
        ];

        const result = TimeEntryUtils.calculateDayTotal(entries);
        assert.strictEqual(result.hours, 8);
        assert.strictEqual(result.minutes, 15);
        assert.strictEqual(result.formatted, '8 hours 15 minutes');
    });

    test('Should group entries by date correctly', () => {
        const entries: TimeEntry[] = [
            {
                id: '1',
                type: 'clock-in',
                timestamp: new Date('2025-01-10T08:00:00')
            },
            {
                id: '2',
                type: 'clock-out',
                timestamp: new Date('2025-01-10T17:00:00')
            },
            {
                id: '3',
                type: 'clock-in',
                timestamp: new Date('2025-01-09T08:00:00')
            },
            {
                id: '4',
                type: 'clock-out',
                timestamp: new Date('2025-01-09T16:30:00')
            }
        ];

        const grouped = TimeEntryUtils.groupEntriesByDate(entries);
        assert.strictEqual(grouped.length, 2);
        
        // Should be sorted by date descending (most recent first)
        assert.strictEqual(grouped[0].date, '2025-01-10');
        assert.strictEqual(grouped[1].date, '2025-01-09');
        
        // Check totals
        assert.strictEqual(grouped[0].formattedDuration, '9 hours');
        assert.strictEqual(grouped[1].formattedDuration, '8 hours 30 minutes');
    });

    test('Should handle empty entries', () => {
        const result = TimeEntryUtils.calculateDayTotal([]);
        assert.strictEqual(result.hours, 0);
        assert.strictEqual(result.minutes, 0);
        assert.strictEqual(result.formatted, '0 minutes');
    });

    test('Should handle incomplete pairs', () => {
        const entries: TimeEntry[] = [
            {
                id: '1',
                type: 'clock-in',
                timestamp: new Date('2025-01-10T08:00:00')
            }
            // Missing clock-out
        ];

        const result = TimeEntryUtils.calculateDayTotal(entries);
        assert.strictEqual(result.hours, 0);
        assert.strictEqual(result.minutes, 0);
        assert.strictEqual(result.formatted, '0 minutes');
    });
});