import * as vscode from 'vscode';

/**
 * Simplifies interactions with the VS Code configuration system.
 */
export class ConfigurationManager {
	private static readonly configurationPrefix = "tacosontitan.toolbox";

	/**
	 * Gets a configuration value for the specified key.
	 * @param key The configuration key to get.
	 * @returns The value of the configuration key, or undefined if it does not exist.
	 */
	public static get<T>(key: string): T | undefined {
		const configuration = vscode.workspace.getConfiguration(ConfigurationManager.configurationPrefix);
		return configuration.get<T>(key);
	}
}