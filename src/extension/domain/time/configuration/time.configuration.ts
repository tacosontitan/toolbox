import { IConfiguration, IConfigurationProvider } from "../../../core/configuration";
import { ILogger, LogLevel } from "../../../core/telemetry";
import { TimeOptions } from "./time.options";

/**
 * Defines the configuration for time tracking features.
 */
export class TimeConfiguration implements IConfiguration<TimeOptions> {

    /**
     * @constructor
     * @param logger The service used to capture errors and log messages for diagnostic purposes.
     * @param configProvider The service used to retrieve configuration values and populate runtime options.
     */
    constructor(
        private readonly logger: ILogger,
        private readonly configProvider: IConfigurationProvider
    ) {}

    /** @inheritdoc */
    async get(): Promise<TimeOptions> {
        try {
            const autoPurge = await this.configProvider.get<boolean>("time.autoPurge") ?? false;
            const retentionPeriod = await this.configProvider.get<number>("time.retentionPeriod") ?? 90;
            return {
                autoPurge,
                retentionPeriod
            };
        } catch (error) {
            this.logger.log(LogLevel.Error, `Unable to load configurations for time tracking. ${error}`);
            throw error;
        }
    }
}