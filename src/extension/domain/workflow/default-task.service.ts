import { Task } from './task';
import { TaskTemplateLoader } from './task-template-loader';
import { TaskTemplate } from './task-template.schema';
import { ITaskService } from './task.service.interface';
import { WorkItem } from './work-item';

/**
 * Service providing synchronous access to default task templates.
 * This service assumes templates have already been loaded during extension initialization.
 */
export class DefaultTaskService implements ITaskService {
    
    /**
     * Gets the default tasks that should be created for a specific work item.
     * @param workItem The work item to get default tasks for.
     * @returns An array of task work items that should be added as children.
     */
    public getDefaultTasksForWorkItem(workItem: WorkItem): WorkItem[] {
        const templates = this.getTaskTemplatesForWorkItem(workItem.type.name);
        return templates.map(template => this.createTaskFromTemplate(template));
    }

    /**
     * Gets task templates that apply to a specific work item type.
     * @param workItemType The work item type to filter by.
     * @returns An array of task templates.
     */
    private getTaskTemplatesForWorkItem(workItemType: string): TaskTemplate[] {
        if (!TaskTemplateLoader.isTemplatesLoaded()) {
            console.warn('Task templates not loaded yet. Returning empty array.');
            return [];
        }
        
        return TaskTemplateLoader.getTemplatesForWorkItemType(workItemType);
    }

    /**
     * Creates a Task work item from a template.
     * @param template The task template.
     * @returns A new Task work item.
     */
    private createTaskFromTemplate(template: TaskTemplate): WorkItem {
        return new Task(
            template.title,
            template.description,
            template.remainingWork,
            template.activity
        );
    }

    // Static methods for backward compatibility and direct access
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
