import { IConfiguration, IConfigurationProvider } from "../../../core/configuration";
import { ILogger, LogLevel } from "../../../core/telemetry";
import { WorkflowOptions } from "./workflow.options";

/**
 * Defines the configuration for workflow management in the extension.
 */
export class WorkflowConfiguration implements IConfiguration<WorkflowOptions> {
    private static readonly SHOW_INACTIVE_TASKS_KEY = "workflow.showInactiveTasks";
    private static readonly INACTIVE_STATES_KEY = "workflow.inactiveStates";
    private static readonly TASK_READY_STATE_KEY = "workflow.taskReadyState";
    private static readonly TASK_DOING_STATE_KEY = "workflow.taskDoingState";
    private static readonly TASK_DONE_STATE_KEY = "workflow.taskDoneState";

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
    async get(): Promise<WorkflowOptions> {
        try {
            const showInactiveTasks = await this.configProvider.get<boolean>(WorkflowConfiguration.SHOW_INACTIVE_TASKS_KEY) ?? false;
            const inactiveStates = await this.configProvider.get<string[]>(WorkflowConfiguration.INACTIVE_STATES_KEY) ?? [];
            const taskReadyState = await this.configProvider.get<string>(WorkflowConfiguration.TASK_READY_STATE_KEY) ?? "Ready";
            const taskDoingState = await this.configProvider.get<string>(WorkflowConfiguration.TASK_DOING_STATE_KEY) ?? "In Progress";
            const taskDoneState = await this.configProvider.get<string>(WorkflowConfiguration.TASK_DONE_STATE_KEY) ?? "Done";
            const workItemStartedState = await this.configProvider.get<string>('workflowOptions.workItemStartedState') ?? "Active";
            return {
                showInactiveTasks,
                inactiveStates,
                taskReadyState,
                taskDoingState,
                taskDoneState,
                workItemStartedState
            };
        } catch (error) {
            this.logger.log(LogLevel.Error, `Unable to load configurations for workflow management. ${error}`);
            throw error;
        }
    }
}