import * as path from 'path';
import * as vscode from 'vscode';
import { JsonFileReader } from '../../core/serialization/json-file-reader';
import { TaskTemplate, TaskTemplateSchema } from './task-template.schema';

/**
 * Service responsible for loading and managing task templates from JSON files.
 * Templates are loaded once during extension initialization and cached for runtime access.
 */
export class TaskTemplateLoader {
    private static taskTemplates: TaskTemplate[] = [];
    private static isLoaded = false;

    constructor(private readonly context: vscode.ExtensionContext) {}

    /**
     * Loads all task templates from JSON files in the resources/tasks directory.
     * This should be called during extension initialization.
     */
    public async loadTemplates(): Promise<void> {
        if (TaskTemplateLoader.isLoaded) {
            return;
        }

        try {
            const templatesPath = path.join(this.context.extensionPath, 'resources', 'tasks');
            const templateFiles = ['development.json', 'planning.json', 'quality-assurance.json', 'release.json', 'review.json'];

            const templates: TaskTemplate[] = [];

            for (const fileName of templateFiles) {
                const filePath = path.join(templatesPath, fileName);
                try {
                    const templateSchema = JsonFileReader.read<TaskTemplateSchema>(filePath);
                    const category = this.extractCategoryFromFileName(fileName);
                    for (const template of templateSchema.templates) {
                        templates.push({
                            ...template,
                            metadata: {
                                ...template.metadata,
                                category
                            }
                        });
                    }
                } catch (error) {
                    console.warn(`Failed to load task template file ${fileName}:`, error);
                }
            }

            TaskTemplateLoader.taskTemplates = templates;
            TaskTemplateLoader.isLoaded = true;

            console.log(`Loaded ${templates.length} task templates from ${templateFiles.length} files`);
        } catch (error) {
            console.error('Failed to load task templates:', error);
            TaskTemplateLoader.taskTemplates = [];
            TaskTemplateLoader.isLoaded = true; // Mark as loaded even if failed to prevent retry loops
        }
    }

    /**
     * Gets all loaded task templates.
     * @returns Array of all task templates
     */
    public static getAllTemplates(): TaskTemplate[] {
        return [...TaskTemplateLoader.taskTemplates];
    }

    /**
     * Gets task templates that apply to a specific work item type.
     * @param workItemType The work item type (e.g., "Feature", "User Story", "Bug")
     * @returns Array of applicable task templates
     */
    public static getTemplatesForWorkItemType(workItemType: string): TaskTemplate[] {
        return TaskTemplateLoader.taskTemplates.filter(template => 
            template.metadata?.appliesTo?.includes(workItemType) || 
            template.appliesTo?.includes(workItemType)
        );
    }

    /**
     * Gets task templates by category.
     * @param category The category to filter by (e.g., "development", "planning")
     * @returns Array of task templates in the specified category
     */
    public static getTemplatesByCategory(category: string): TaskTemplate[] {
        return TaskTemplateLoader.taskTemplates.filter(template => 
            template.metadata?.category === category
        );
    }

    /**
     * Checks if templates have been loaded.
     * @returns True if templates are loaded, false otherwise
     */
    public static isTemplatesLoaded(): boolean {
        return TaskTemplateLoader.isLoaded;
    }

    /**
     * Clears loaded templates (useful for testing).
     */
    public static clearTemplates(): void {
        TaskTemplateLoader.taskTemplates = [];
        TaskTemplateLoader.isLoaded = false;
    }

    /**
     * Extracts category name from file name.
     * @param fileName The JSON file name
     * @returns The category name
     */
    private extractCategoryFromFileName(fileName: string): string {
        return fileName.replace('.json', '').replace(/-/g, ' ');
    }
}
