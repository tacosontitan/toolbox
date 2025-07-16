/**
 * Typed configuration schemas for the extension.
 * These interfaces define the structure and requirements for different configuration areas.
 */

/**
 * Azure DevOps configuration schema
 */
export interface AzureDevOpsConfiguration {
	/** Azure DevOps organization URL or name */
	organization: string;
	
	/** Azure DevOps project name */
	project: string;
	
	/** User's display name in Azure DevOps */
	userDisplayName: string;
	
	/** Personal Access Token for authentication */
	personalAccessToken: string;
	
	/** Task state representing ready to work */
	readyTaskState: string;
	
	/** Task state representing work in progress */
	inProgressTaskState: string;
	
	/** Task state representing completed work */
	doneTaskState: string;
	
	/** Whether to show inactive/completed tasks in tree view */
	showInactiveTasks: boolean;
}

/**
 * Time tracking configuration schema
 */
export interface TimeConfiguration {
	/** Whether to automatically clean up old time entries */
	autoCleanup: boolean;
	
	/** Number of days to retain time entries before cleanup */
	retentionDays: number;
	
	/** Default time tracking precision in minutes */
	defaultPrecisionMinutes: number;
}

/**
 * Overview/dashboard configuration schema
 */
export interface OverviewConfiguration {
	/** Number of days to show in recent completions */
	recentCompletionsDays: number;
	
	/** Whether to show productivity metrics */
	showProductivityMetrics: boolean;
	
	/** Refresh interval for dashboard data in minutes */
	refreshIntervalMinutes: number;
}

/**
 * Configuration key mappings for VS Code settings
 */
export const ConfigurationKeys = {
	// Azure DevOps
	ORGANIZATION: 'azureDevOps.organization',
	PROJECT: 'azureDevOps.project',
	USER_DISPLAY_NAME: 'azureDevOps.userDisplayName',
	PERSONAL_ACCESS_TOKEN: 'azureDevOps.personalAccessToken',
	READY_TASK_STATE: 'azureDevOps.readyTaskState',
	IN_PROGRESS_TASK_STATE: 'azureDevOps.inProgressTaskState',
	DONE_TASK_STATE: 'azureDevOps.doneTaskState',
	SHOW_INACTIVE_TASKS: 'azureDevOps.showInactiveTasks',
	
	// Time Tracking
	AUTO_CLEANUP: 'time.autoCleanup',
	RETENTION_DAYS: 'time.retentionDays',
	DEFAULT_PRECISION_MINUTES: 'time.defaultPrecisionMinutes',
	
	// Overview
	RECENT_COMPLETIONS_DAYS: 'overview.recentCompletionsDays',
	SHOW_PRODUCTIVITY_METRICS: 'overview.showProductivityMetrics',
	REFRESH_INTERVAL_MINUTES: 'overview.refreshIntervalMinutes'
} as const;

/**
 * Default configuration values
 */
export const DefaultConfiguration = {
	// Azure DevOps defaults
	READY_TASK_STATE: 'Ready',
	IN_PROGRESS_TASK_STATE: 'In Progress',
	DONE_TASK_STATE: 'Done',
	SHOW_INACTIVE_TASKS: false,
	
	// Time tracking defaults
	AUTO_CLEANUP: false,
	RETENTION_DAYS: 90,
	DEFAULT_PRECISION_MINUTES: 15,
	
	// Overview defaults
	RECENT_COMPLETIONS_DAYS: 7,
	SHOW_PRODUCTIVITY_METRICS: true,
	REFRESH_INTERVAL_MINUTES: 5
} as const;

/**
 * Configuration validation rules
 */
export const ValidationRules = {
	AzureDevOps: {
		required: [
			'organization',
			'project',
			'userDisplayName',
			'personalAccessToken'
		] as const,
		optional: [
			'readyTaskState',
			'inProgressTaskState',
			'doneTaskState',
			'showInactiveTasks'
		] as const
	},
	Time: {
		required: [] as const,
		optional: [
			'autoCleanup',
			'retentionDays',
			'defaultPrecisionMinutes'
		] as const
	},
	Overview: {
		required: [] as const,
		optional: [
			'recentCompletionsDays',
			'showProductivityMetrics',
			'refreshIntervalMinutes'
		] as const
	}
} as const;
