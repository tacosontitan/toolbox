import { TaskTemplateLoader } from './task-template-loader';
import { TaskTemplate } from './task-template.schema';

/**
 * Service providing synchronous access to default task templates.
 * This service assumes templates have already been loaded during extension initialization.
 */
export class DefaultTaskService {
    
    /**
     * Gets default tasks for a specific work item type.
     * @param workItemType The work item type (e.g., "Feature", "User Story", "Bug")
     * @returns Array of task templates applicable to the work item type
     */
    public static getDefaultTasksForWorkItem(workItemType: string): TaskTemplate[] {
        if (!TaskTemplateLoader.isTemplatesLoaded()) {
            console.warn('Task templates not loaded yet. Returning empty array.');
            return [];
        }
        
        return TaskTemplateLoader.getTemplatesForWorkItemType(workItemType);
    }

    /**
     * Gets all default tasks regardless of work item type.
     * @returns Array of all task templates
     */
    public static getAllDefaultTasks(): TaskTemplate[] {
        if (!TaskTemplateLoader.isTemplatesLoaded()) {
            console.warn('Task templates not loaded yet. Returning empty array.');
            return [];
        }
        
        return TaskTemplateLoader.getAllTemplates();
    }

    /**
     * Gets default tasks by category.
     * @param category The category name (e.g., "development", "planning")
     * @returns Array of task templates in the specified category
     */
    public static getDefaultTasksByCategory(category: string): TaskTemplate[] {
        if (!TaskTemplateLoader.isTemplatesLoaded()) {
            console.warn('Task templates not loaded yet. Returning empty array.');
            return [];
        }
        
        return TaskTemplateLoader.getTemplatesByCategory(category);
    }

    /**
     * Checks if default tasks are available.
     * @returns True if default tasks have been loaded, false otherwise
     */
    public static isAvailable(): boolean {
        return TaskTemplateLoader.isTemplatesLoaded();
    }
}

/**
 * Legacy function for backward compatibility.
 * @deprecated Use DefaultTaskService.getAllDefaultTasks() instead
 */
export function getDefaultTasks(): TaskTemplate[] {
    return DefaultTaskService.getAllDefaultTasks();
}
