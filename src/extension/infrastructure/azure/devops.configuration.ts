import { IConfiguration, IConfigurationProvider, ISecretProvider, MissingConfigurationError } from "../../core/configuration";
import { ILogger, LogLevel } from "../../core/telemetry";
import { DevOpsOptions } from "./devops.options";

/**
 * Defines the configuration for communicating with Azure DevOps.
 */
export class DevOpsConfiguration implements IConfiguration<DevOpsOptions> {
    private static readonly USE_CLASSIC_URL_KEY = "azure.devops.useClassicUrl";
    private static readonly ORGANIZATION_KEY = "azure.devops.organization";
    private static readonly PROJECT_KEY = "azure.devops.project";
    private static readonly USER_DISPLAY_NAME_KEY = "azure.devops.userDisplayName";
    private static readonly PERSONAL_ACCESS_TOKEN_KEY = "azure.devops.personalAccessToken";

    /**
     * @constructor
     * @param logger The service used to capture errors and log messages for diagnostic purposes.
     * @param configProvider The service used to retrieve configuration values and populate runtime options.
     * @param secretProvider The service used to retrieve sensitive values like personal access tokens.
     */
    constructor(
        private readonly logger: ILogger,
        private readonly configProvider: IConfigurationProvider,
        private readonly secretProvider: ISecretProvider
    ) {}

    /** @inheritdoc */
    async get(): Promise<DevOpsOptions> {
        try {
            const organization = await this.configProvider.get<string>(DevOpsConfiguration.ORGANIZATION_KEY);
            if (!organization)
            {
                throw new MissingConfigurationError(DevOpsConfiguration.ORGANIZATION_KEY, "Azure DevOps Organization", "Please ensure your organization name is set in the configuration.");
            }

            const project = await this.configProvider.get<string>(DevOpsConfiguration.PROJECT_KEY);
            if (!project)
            {
                throw new MissingConfigurationError(DevOpsConfiguration.PROJECT_KEY, "Azure DevOps Project", "Please ensure your project name is set in the configuration.");
            }

            const userDisplayName = await this.configProvider.get<string>(DevOpsConfiguration.USER_DISPLAY_NAME_KEY);
            if (!userDisplayName)
            {
                throw new MissingConfigurationError(DevOpsConfiguration.USER_DISPLAY_NAME_KEY, "User Display Name", "Please ensure your display name is set in the configuration.");
            }

            const personalAccessToken = await this.secretProvider.get<string>(DevOpsConfiguration.PERSONAL_ACCESS_TOKEN_KEY);
            if (!personalAccessToken)
            {
                throw new MissingConfigurationError(DevOpsConfiguration.PERSONAL_ACCESS_TOKEN_KEY, "Personal Access Token", "Please ensure your Personal Access Token is set in the secrets.");
            }

            const useClassicUrl = await this.configProvider.get<boolean>(DevOpsConfiguration.USE_CLASSIC_URL_KEY) ?? false;
            return {
                useClassicUrl: useClassicUrl,
                organization: organization!,
                project: project!,
                userDisplayName: userDisplayName!,
                personalAccessToken: personalAccessToken!
            };
        } catch (error) {
            this.logger.log(LogLevel.Error, `Unable to load configurations for communication with Azure DevOps. ${error}`);
            throw error;
        }
    }
}