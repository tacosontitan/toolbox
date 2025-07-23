import * as vscode from 'vscode';

/**
 * Defines members for reading JSON files within the VS Code workspace.
 */
export class JsonFileReader {
    /**
     * Reads a JSON file from the workspace and parses it into an object of type T.
     * @param filePath The path to the JSON file.
     * @returns A promise that resolves to the parsed object or undefined if an error occurs.
     */
    public static async read<T>(filePath: string): Promise<T | undefined> {
        const fileUri = vscode.Uri.file(filePath);
        const binaryData = await vscode.workspace.fs.readFile(fileUri);
        const stringData = binaryData.toString();
        return JSON.parse(stringData) as T;
    }
}