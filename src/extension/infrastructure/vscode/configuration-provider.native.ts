import * as vscode from 'vscode';
import { IConfigurationProvider } from "../../core/configuration/configuration-provider.interface";

/**
 * Facilitates interactions with the native VS Code configuration system.
 */
export class NativeConfigurationProvider implements IConfigurationProvider {
    constructor(
        private readonly configurationPrefix: string = "tacosontitan.toolbox"
    ) { }

    /** @inheritdoc */
    async get<T>(key: string): Promise<T | undefined> {
        const configuration = vscode.workspace.getConfiguration(this.configurationPrefix);
        return configuration.get<T>(key);
    }

    /** @inheritdoc */
    async set<T>(key: string, value: T): Promise<void> {
        const configuration = vscode.workspace.getConfiguration(this.configurationPrefix);
        await configuration.update(key, value, vscode.ConfigurationTarget.Global);
    }
}