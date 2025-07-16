import * as assert from 'assert';
import * as vscode from 'vscode';
import { TimeEntry } from '../todo/time';
import { TimeEntryService } from '../todo/time/time-entry-service';

suite('Data Retention Test Suite', () => {
    let mockContext: vscode.ExtensionContext;
    let timeEntryService: TimeEntryService;

    setup(() => {
        // Create a mock extension context
        const mockGlobalState = new Map<string, any>();
        mockContext = {
            globalState: {
                get: <T>(key: string, defaultValue?: T): T => {
                    return mockGlobalState.get(key) ?? defaultValue!;
                },
                update: (key: string, value: any): Thenable<void> => {
                    mockGlobalState.set(key, value);
                    return Promise.resolve();
                },
                keys: (): readonly string[] => {
                    return Array.from(mockGlobalState.keys());
                },
                setKeysForSync: (keys: readonly string[]): void => {}
            }
        } as any;

        timeEntryService = new TimeEntryService(mockContext);
    });

    test('Data retention should remove old entries based on retention policy', async () => {
        // Mock the workspace configuration to return specific retention settings
        const originalGetConfiguration = vscode.workspace.getConfiguration;
        vscode.workspace.getConfiguration = (section?: string) => {
            return {
                get: <T>(key: string, defaultValue?: T): T => {
                    if (key === 'retentionDays') { return 30 as T; }
                    if (key === 'autoCleanup') { return false as T; } // Disable auto cleanup for manual testing
                    return defaultValue!;
                },
                update: () => Promise.resolve(),
                inspect: () => undefined,
                has: () => true
            } as any;
        };

        try {
            // Create test data with entries older and newer than retention period
            const now = new Date();
            const oldDate = new Date(now.getTime() - (35 * 24 * 60 * 60 * 1000)); // 35 days ago (should be removed)
            const recentDate = new Date(now.getTime() - (5 * 24 * 60 * 60 * 1000)); // 5 days ago (should be kept)

            const testEntries = [
                { id: '1', type: 'clock-in', timestamp: oldDate.toISOString() },
                { id: '2', type: 'clock-out', timestamp: oldDate.toISOString() },
                { id: '3', type: 'clock-in', timestamp: recentDate.toISOString() },
                { id: '4', type: 'clock-out', timestamp: recentDate.toISOString() }
            ];

            // Set initial data
            await mockContext.globalState.update('tacosontitan.toolbox.timeEntries', testEntries);

            // Perform cleanup
            await timeEntryService.cleanupOldEntries(false);

            // Get remaining entries
            const remainingEntries = mockContext.globalState.get<TimeEntry[]>('tacosontitan.toolbox.timeEntries', []);

            // Should have removed the 2 old entries and kept the 2 recent ones
            assert.strictEqual(remainingEntries.length, 2, 'Should keep only recent entries');

            // Verify that only recent entries remain
            for (const entry of remainingEntries) {
                const entryDate = new Date(entry.timestamp);
                const daysDiff = (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
                assert.ok(daysDiff < 30, 'Remaining entries should be within retention period');
            }

        } finally {
            // Restore original getConfiguration
            vscode.workspace.getConfiguration = originalGetConfiguration;
        }
    });

    test('Data retention should not remove entries if all are within retention period', async () => {
        // Mock the workspace configuration
        const originalGetConfiguration = vscode.workspace.getConfiguration;
        vscode.workspace.getConfiguration = (section?: string) => {
            return {
                get: <T>(key: string, defaultValue?: T): T => {
                    if (key === 'retentionDays') { return 90 as T; }
                    if (key === 'autoCleanup') { return false as T; }
                    return defaultValue!;
                },
                update: () => Promise.resolve(),
                inspect: () => undefined,
                has: () => true
            } as any;
        };

        try {
            // Create test data with all entries within retention period
            const now = new Date();
            const recentDate1 = new Date(now.getTime() - (10 * 24 * 60 * 60 * 1000)); // 10 days ago
            const recentDate2 = new Date(now.getTime() - (20 * 24 * 60 * 60 * 1000)); // 20 days ago

            const testEntries = [
                { id: '1', type: 'clock-in', timestamp: recentDate1.toISOString() },
                { id: '2', type: 'clock-out', timestamp: recentDate1.toISOString() },
                { id: '3', type: 'clock-in', timestamp: recentDate2.toISOString() },
                { id: '4', type: 'clock-out', timestamp: recentDate2.toISOString() }
            ];

            // Set initial data
            await mockContext.globalState.update('tacosontitan.toolbox.timeEntries', testEntries);

            // Perform cleanup
            await timeEntryService.cleanupOldEntries(false);

            // Get remaining entries
            const remainingEntries = mockContext.globalState.get('tacosontitan.toolbox.timeEntries', []);

            // Should have kept all entries
            assert.strictEqual(remainingEntries.length, 4, 'Should keep all entries within retention period');

        } finally {
            // Restore original getConfiguration
            vscode.workspace.getConfiguration = originalGetConfiguration;
        }
    });
});