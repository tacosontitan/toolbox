import { ServiceLocator } from "../../core";
import { JsonTemplateLoader } from "./pre-defined-tasks/json-template-loader";
import { PreDefinedTask } from "./pre-defined-tasks/pre-defined-task";

/**
 * Defines the default tasks used to execute a work item in an Agile workflow.
 * This provides a backward-compatible interface while loading from JSON templates.
 */
let _defaultTasks: PreDefinedTask[] | undefined;

/**
 * Get the default tasks. This loads templates from JSON on first access.
 */
export async function getDefaultTasks(): Promise<PreDefinedTask[]> {
    if (!_defaultTasks) {
        const templateLoader = ServiceLocator.getService(JsonTemplateLoader);
        await templateLoader.loadAllTemplates();
        _defaultTasks = templateLoader.createPreDefinedTasks();
    }
    return _defaultTasks;
}

/**
 * Synchronous access to default tasks (for backward compatibility).
 * Returns empty array if templates haven't been loaded yet.
 */
export const DefaultTasks: PreDefinedTask[] = [];

/**
 * Initialize the default tasks by loading templates.
 * This should be called during extension activation.
 */
export async function initializeDefaultTasks(): Promise<void> {
    _defaultTasks = await getDefaultTasks();
    // Update the exported array for backward compatibility
    DefaultTasks.length = 0;
    DefaultTasks.push(..._defaultTasks);
}