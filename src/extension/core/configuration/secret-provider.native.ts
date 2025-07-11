import * as vscode from "vscode";
import { ISecretProvider } from "./secret-provider.interface";

/**
 * Facilitates secure storage and retrieval of secrets using the native VS Code secrets API.
 */
export class NativeSecretProvider implements ISecretProvider{
    constructor(
        private readonly context: vscode.ExtensionContext
    ) { }

    /** @inheritdoc */
    async get<T>(key: string): Promise<T | undefined> {
        return this.context.secrets.get(key) as Promise<T | undefined>;
    }

    /** @inheritdoc */
    async set<T>(key: string, value: T): Promise<void> {
        const stringValue = typeof value === "string" ? value : JSON.stringify(value);
        await this.context.secrets.store(key, stringValue);
    }
}