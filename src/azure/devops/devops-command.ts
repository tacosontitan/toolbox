import * as vscode from 'vscode';
import { ConfigurationManager } from "../../configuration-manager";
import { AzureCommand } from "../azure-command";
import { IAssistant } from '../../assistant';

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
	protected async getPersonalAccessToken(assistant: IAssistant): Promise<string | null> {
		const personalAccessTokenSecretId = "pineappleCove.toolbox.azure.devops.personalAccessToken";
		let personalAccessToken = await assistant.extensionContext.secrets.get(personalAccessTokenSecretId);
		if (personalAccessToken) {
			return personalAccessToken;
		}

		personalAccessToken = personalAccessToken = await vscode.window.showInputBox({
			prompt: "🙏 Please provide your personal access token for Azure Devops.",
			password: true
		});

		if (!personalAccessToken) {
			vscode.window.showErrorMessage("A personal access token is required.");
			return null;
		}

		await assistant.extensionContext.secrets.store(personalAccessTokenSecretId, personalAccessToken);
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

	protected getUserDisplayName(): string | null {
		const userDisplayName = ConfigurationManager.get<string | null>("azure.devops.userDisplayName");
		if (!userDisplayName) {
			vscode.window.showErrorMessage("User display name for Azure DevOps is not configured. Commands that require it will not work.");
			return null;
		}

		return userDisplayName;
	}
}