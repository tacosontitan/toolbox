import { IConfiguration, IConfigurationProvider } from "../../../core/configuration";
import { ILogger, LogLevel } from "../../../core/telemetry";
import { StatisticsOptions } from "./statistics.options";

/**
 * Defines the configuration for statistics in the extension.
 */
export class StatisticsConfiguration implements IConfiguration<StatisticsOptions> {
    private static readonly VELOCITY_SPAN_IN_WEEKS = 6;
    private static readonly VELOCITY_SPAN_IN_DAYS = StatisticsConfiguration.VELOCITY_SPAN_IN_WEEKS * 7;
    private static readonly REFRESH_INTERVAL_IN_MINUTES = 60;
    private static readonly SHOW_PRODUCTIVITY_METRICS_KEY = "statistics.showProductivityMetrics";
    private static readonly VELOCITY_SPAN_KEY = "statistics.velocitySpan";
    private static readonly REFRESH_INTERVAL_KEY = "statistics.refreshInterval";

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
    async get(): Promise<StatisticsOptions> {
        try {
            const showProductivityMetrics = await this.configProvider.get<boolean>(StatisticsConfiguration.SHOW_PRODUCTIVITY_METRICS_KEY) ?? true;
            const velocitySpan = await this.configProvider.get<number>(StatisticsConfiguration.VELOCITY_SPAN_KEY) ?? StatisticsConfiguration.VELOCITY_SPAN_IN_DAYS;
            const refreshInterval = await this.configProvider.get<number>(StatisticsConfiguration.REFRESH_INTERVAL_KEY) ?? StatisticsConfiguration.REFRESH_INTERVAL_IN_MINUTES;
            return {
                showProductivityMetrics,
                velocitySpan,
                refreshInterval
            };
        } catch (error) {
            this.logger.log(LogLevel.Error, `Unable to load configurations for statistics. ${error}`);
            throw error;
        }
    }
}