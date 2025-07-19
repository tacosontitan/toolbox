import * as assert from 'assert';
import * as vscode from 'vscode';
import { OverviewWebviewProvider } from '../application/providers/overview-webview-provider';

suite('Overview Test Suite', () => {
    test('OverviewWebviewProvider should create without DevOps service', () => {
        const extensionUri = vscode.Uri.file('/test');
        const provider = new OverviewWebviewProvider(extensionUri);
        
        assert.ok(provider);
        assert.strictEqual(OverviewWebviewProvider.viewType, 'overviewWebView');
    });

    test('OverviewWebviewProvider should create with DevOps service', () => {
        const extensionUri = vscode.Uri.file('/test');
        const mockDevOpsService = {} as any; // Mock service for testing
        const provider = new OverviewWebviewProvider(extensionUri, mockDevOpsService);
        
        assert.ok(provider);
    });
});