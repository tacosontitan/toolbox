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

	/**
	 * Retrieves the Azure DevOps project name from the configuration.
	 * @returns The Azure DevOps project name if configured; otherwise, null.
	 */
	protected getProjectName(): string | null {
		const projectName = ConfigurationManager.get<string | null>("azure.devops.project");
		if (!projectName) {
			vscode.window.showErrorMessage("Azure DevOps project is not configured. Commands that require it will not work.");
			return null;
		}

		return projectName;
	}

	/**
	 * Retrieves the Azure DevOps organization URL from the configuration.
	 * @returns The Azure DevOps organization URL if configured; otherwise, null.
	 */
	protected getOrganizationUri(): string | null {
		const organization = ConfigurationManager.get<string | null>("azure.devops.organization");
		if (!organization) {
			vscode.window.showErrorMessage("Azure DevOps organization is not configured. Commands that require it will not work.");
			return null;
		}

		const useClassicUri = ConfigurationManager.get<boolean>("azure.devops.useClassicUri");
		if (useClassicUri) {
			return `https://${organization}.visualstudio.com`;
		}

		return `https://dev.azure.com/${organization}`;
	}
}