import * as devops from 'azure-devops-node-api';
import * as vscode from 'vscode';
import { IAssistant } from '../../assistant';
import { ConfigurationManager } from "../../configuration-manager";
import { AzureCommand } from "../azure-command";

/**
 * Represents an {@link AzureCommand} focused on supporting Azure DevOps operations.
 */
export abstract class DevOpsCommand
	extends AzureCommand {

	protected readonly assistant: IAssistant;

	/**
	 * Creates a new {@link DevOpsCommand} with the specified ID.
	 * @param id The unique identifier for the command.
	 * @param logger The logger to use for logging messages.
	 */
	protected constructor(id: string, assistant: IAssistant) {
		super(`devops.${id}`);
		this.assistant = assistant;
	}

	/**
	 * Retrieves the Azure DevOps personal access token (PAT) from the configuration.
	 * @returns The personal access token if configured; otherwise, null.
	 * @remarks If the PAT is not configured, an error message is displayed to the user, and null is returned.
	 */
	protected async getPersonalAccessToken(): Promise<string | null> {
		const personalAccessTokenSecretId = "tacosontitan.toolbox.azure.devops.personalAccessToken";
		let personalAccessToken = await this.assistant.extensionContext.secrets.get(personalAccessTokenSecretId);
		let tokenIsValid = await this.determineIfPersonalAccessTokenIsValid(personalAccessToken);
		if (personalAccessToken && tokenIsValid) {
			return personalAccessToken;
		}

		personalAccessToken = personalAccessToken = await vscode.window.showInputBox({
			prompt: "🙏 Please provide your personal access token for Azure Devops.",
			password: true
		});

		tokenIsValid = await this.determineIfPersonalAccessTokenIsValid(personalAccessToken);
		if (!personalAccessToken || !tokenIsValid) {
			return null;
		}

		await this.assistant.extensionContext.secrets.store(personalAccessTokenSecretId, personalAccessToken);
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

	private async determineIfPersonalAccessTokenIsValid(token: string | null | undefined): Promise<boolean> {
		try {
			if (!token) {
				vscode.window.showErrorMessage("A personal access token is required.");
				return false;
			}

			const organizationUri = this.getOrganizationUri();
			if (!organizationUri) {
				return false;
			}

			const authenticationHandler = devops.getPersonalAccessTokenHandler(token);
			const connection = new devops.WebApi(organizationUri, authenticationHandler);
			const workItemApi = await connection.getWorkItemTrackingApi();
			await workItemApi.getWorkItems([1]);
			return true;
		} catch (error: any) {
			if (error.statusCode === 401) {
				vscode.window.showErrorMessage("The provided personal access token is invalid. Please check your token and try again.");
				return false;
			}

			vscode.window.showErrorMessage(`An error occurred while validating the personal access token: ${error.message}`);
			return false;
		}
	}
}