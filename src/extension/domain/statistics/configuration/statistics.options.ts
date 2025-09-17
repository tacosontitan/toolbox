/**
 * Defines options for querying statistics in the extension.
 */
export interface StatisticsOptions {
	/**
     * Indicates whether or not to show productivity metrics.
     */
	showProductivityMetrics: boolean;

	/**
     * The span of time, in days, to consider for velocity calculations.
     */
	velocitySpan: number;


	/**
     * The length of time, in minutes, to wait before refreshing statistics.
     */
	refreshInterval: number;
}