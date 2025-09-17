import * as vscode from 'vscode';
import { DefaultTaskService } from '../default-task.service';
import { TaskTemplate } from '../task-template.schema';

/**
 * Legacy template loader for backward compatibility.
 * @deprecated Use DefaultTaskService directly instead
 */
export class JsonTemplateLoader {
    constructor(private readonly context: vscode.ExtensionContext) {}

    /**
     * Loads all templates (no-op since templates are loaded during initialization).
     * @deprecated Templates are now loaded during extension initialization
     */
    public async loadAllTemplates(): Promise<void> {
        // Templates are already loaded during extension initialization
        // This method is kept for backward compatibility
    }

    /**
     * Creates pre-defined tasks from loaded templates.
     * @deprecated Use DefaultTaskService.getAllDefaultTasks() instead
     */
    public createPreDefinedTasks(): TaskTemplate[] {
        return DefaultTaskService.getAllDefaultTasks();
    }

    /**
     * Gets templates for a specific work item type.
     * @deprecated Use DefaultTaskService.getDefaultTasksForWorkItem() instead
     */
    public getTemplatesForWorkItemType(workItemType: string): TaskTemplate[] {
        return DefaultTaskService.getDefaultTasksForWorkItem(workItemType);
    }
}
