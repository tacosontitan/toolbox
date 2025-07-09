import * as devops from 'azure-devops-node-api';
import * as vscode from 'vscode';
import { IConfigurationProvider, ISecretProvider } from '../../configuration';
import { ConfigurationManager } from "../../configuration-manager";
import { IServiceProvider } from '../../dependency-injection';
import { AzureCommand } from "../azure-command";

/**
 * Represents an {@link AzureCommand} focused on supporting Azure DevOps operations.
 */
export abstract class DevOpsCommand
	extends AzureCommand {
	private readonly secretProvider: ISecretProvider;
	private readonly configurationProvider: IConfigurationProvider;

	/**
	 * Creates a new {@link DevOpsCommand} with the specified ID.
	 * @param id The unique identifier for the command.
	 * @param logger The logger to use for logging messages.
	 */
	protected constructor(
		id: string,
		serviceProvider: IServiceProvider
	) {
		super(`devops.${id}`, serviceProvider);
		this.secretProvider = serviceProvider.getRequiredService(ISecretProvider);
		this.configurationProvider = serviceProvider.getRequiredService(IConfigurationProvider);
	}

	/**
	 * Retrieves the Azure DevOps personal access token (PAT) from the configuration.
	 * @returns The personal access token if configured; otherwise, null.
	 * @remarks If the PAT is not configured, an error message is displayed to the user, and null is returned.
	 */
	protected async getPersonalAccessToken(): Promise<string | null> {
		const personalAccessTokenSecretId = "tacosontitan.toolbox.azure.devops.personalAccessToken";
		let personalAccessToken = await this.secretProvider.get<string>(personalAccessTokenSecretId);
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

		await this.secretProvider.set(personalAccessTokenSecretId, personalAccessToken);
		return personalAccessToken;
	}

	/**
	 * Retrieves the Azure DevOps project name from the configuration.
	 * @returns The Azure DevOps project name if configured; otherwise, null.
	 */
	protected async getProjectName(): Promise<string | null> {
		const projectName = await this.configurationProvider.get<string>("azure.devops.project");
		if (!projectName) {
			vscode.window.showErrorMessage("Azure DevOps project is not configured. Commands that require it will not work.");
			return null;
		}

		return projectName;
	}

	/**`
	 * Retrieves the Azure DevOps organization URL from the configuration.
	 * @returns The Azure DevOps organization URL if configured; otherwise, null.
	 */
	protected async getOrganizationUri(): Promise<string | null> {
		const organization = await this.configurationProvider.get<string>("azure.devops.organization");
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

	protected async getUserDisplayName(): Promise<string | null> {
		const userDisplayName = await this.configurationProvider.get<string>("azure.devops.userDisplayName");
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

			const organizationUri = await this.getOrganizationUri();
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