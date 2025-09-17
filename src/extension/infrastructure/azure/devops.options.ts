/**
 * Defines options for communicating with Azure DevOps.
 */
export interface DevOpsOptions {
	/**
	 * Indicates whether or not the classic URL format should be used to communicate with the configured organization.
	 */
	useClassicUrl: boolean;

	/**
	 * The organization within Azure DevOps the extension should focus on supporting.
	 */
	organization: string;

	/**
	 * The name of the project the extension should focus on supporting.
	 */
	project: string;

	/**
	 * The display name used to represent the user in Azure DevOps.
	 *
	 * @remarks This is used for identifying the user in work items and other Azure DevOps features.
	 */
	userDisplayName: string;

	/**
	 * The personal access token used for authentication with Azure DevOps.
	 */
	personalAccessToken: string;
}