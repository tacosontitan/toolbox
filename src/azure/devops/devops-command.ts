import { ConfigurationManager } from "../../configuration-manager";
import { AzureCommand } from "../azure-command";
import * as vscode from 'vscode';

/**
 * Represents an {@link AzureCommand} focused on supporting Azure DevOps operations.
 */
export abstract class DevOpsCommand
	extends AzureCommand {

	/**
	 * Creates a new {@link DevOpsCommand} with the specified ID.
	 * @param id The unique identifier for the command.
	 */
	protected constructor(id: string) {
		super(`devops.${id}`);
	}
	
	/**
	 * Retrieves the Azure DevOps personal access token (PAT) from the configuration.
	 * @returns The personal access token if configured; otherwise, null.
	 * @remarks If the PAT is not configured, an error message is displayed to the user, and null is returned.
	 */
	protected getPersonalAccessToken(): string | null {
		const personalAccessToken = ConfigurationManager.get<string | null>("azure.devops.personalAccessToken");
		if (!personalAccessToken) {
			vscode.window.showErrorMessage("Personal access token for Azure DevOps is not configured. Commands that require it will not work.");
			return null;
		}
		
		return personalAccessToken;
	}
}