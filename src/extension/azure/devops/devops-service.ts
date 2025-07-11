import * as devops from "azure-devops-node-api";
import { window } from "vscode";

import { IConfigurationProvider, ISecretProvider } from "../../core/configuration";

export class DevOpsService {
    constructor(
        private readonly secretProvider: ISecretProvider,
        private readonly configurationProvider: IConfigurationProvider
    ) { }

	/**
	 * Retrieves the Azure DevOps personal access token (PAT) from the configuration.
	 * @returns The personal access token if configured; otherwise, null.
	 * @remarks If the PAT is not configured, an error message is displayed to the user, and null is returned.
	 */
	public async getPersonalAccessToken(): Promise<string | null> {
		const personalAccessTokenSecretId = "tacosontitan.toolbox.azure.devops.personalAccessToken";
		let personalAccessToken = await this.secretProvider.get<string>(personalAccessTokenSecretId);
		let tokenIsValid = await this.determineIfPersonalAccessTokenIsValid(personalAccessToken);
		if (personalAccessToken && tokenIsValid) {
			return personalAccessToken;
		}

		personalAccessToken = await window.showInputBox({
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
	public async getProjectName(): Promise<string | null> {
		const projectName = await this.configurationProvider.get<string>("azure.devops.project");
		if (!projectName) {
			window.showErrorMessage("Azure DevOps project is not configured. Commands that require it will not work.");
			return null;
		}

		return projectName;
	}

	/**`
	 * Retrieves the Azure DevOps organization URL from the configuration.
	 * @returns The Azure DevOps organization URL if configured; otherwise, null.
	 */
	public async getOrganizationUri(): Promise<string | null> {
		const organization = await this.configurationProvider.get<string>("azure.devops.organization");
		if (!organization) {
			window.showErrorMessage("Azure DevOps organization is not configured. Commands that require it will not work.");
			return null;
		}

		const useClassicUri = await this.configurationProvider.get<boolean>("azure.devops.useClassicUri");
		if (useClassicUri) {
			return `https://${organization}.visualstudio.com`;
		}

		return `https://dev.azure.com/${organization}`;
	}

	public async getUserDisplayName(): Promise<string | null> {
		const userDisplayName = await this.configurationProvider.get<string>("azure.devops.userDisplayName");
		if (!userDisplayName) {
			window.showErrorMessage("User display name for Azure DevOps is not configured. Commands that require it will not work.");
			return null;
		}

		return userDisplayName;
	}

	public async getDefaultTaskState(): Promise<string> {
		const defaultTaskState = await this.configurationProvider.get<string>("azure.devops.defaultTaskState");
		return defaultTaskState || "New";
	}

	public async getShowRemovedTasks(): Promise<boolean> {
		const showRemovedTasks = await this.configurationProvider.get<boolean>("azure.devops.showRemovedTasks");
		return showRemovedTasks || false;
	}

	private async determineIfPersonalAccessTokenIsValid(token: string | null | undefined): Promise<boolean> {
		try {
			if (!token) {
				window.showErrorMessage("A personal access token is required.");
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
				window.showErrorMessage("The provided personal access token is invalid. Please check your token and try again.");
				return false;
			}

			window.showErrorMessage(`An error occurred while validating the personal access token: ${error.message}`);
			return false;
		}
	}
}