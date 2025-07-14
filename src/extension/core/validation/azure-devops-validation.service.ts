import { WorkItemTrackingApi } from 'azure-devops-node-api/WorkItemTrackingApi';
import { ILogger, LogLevel } from '../../core/telemetry';

/**
 * Domain service for common Azure DevOps validation patterns.
 * Encapsulates validation logic and error handling.
 */
export class AzureDevOpsValidationService {
    constructor(private readonly logger: ILogger) {}

    /**
     * Validates that a work item tracking client is available.
     */
    validateClient(client: WorkItemTrackingApi | null, operation: string): boolean {
        if (!client) {
            const message = `Cannot ${operation}: Azure DevOps client not available`;
            this.logger.log(LogLevel.Error, message);
            return false;
        }
        return true;
    }

    /**
     * Validates that required configuration is present.
     */
    validateConfiguration(config: { [key: string]: string | null }, operation: string): boolean {
        const missingFields = Object.entries(config)
            .filter(([_, value]) => !value)
            .map(([key, _]) => key);

        if (missingFields.length > 0) {
            const message = `Cannot ${operation}: Missing configuration for ${missingFields.join(', ')}`;
            this.logger.log(LogLevel.Error, message);
            return false;
        }
        return true;
    }

    /**
     * Validates that a work item ID is valid.
     */
    validateWorkItemId(workItemId: number | undefined, operation: string): boolean {
        if (!workItemId || workItemId <= 0) {
            const message = `Cannot ${operation}: Invalid work item ID`;
            this.logger.log(LogLevel.Error, message);
            return false;
        }
        return true;
    }

    /**
     * Logs and handles API errors consistently.
     */
    handleApiError(error: Error, operation: string, workItemId?: number): void {
        const workItemContext = workItemId ? ` for work item #${workItemId}` : '';
        const message = `Failed to ${operation}${workItemContext}: ${error.message}`;
        this.logger.log(LogLevel.Error, message);
    }
}