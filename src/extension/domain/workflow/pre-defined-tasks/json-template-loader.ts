import * as path from 'path';
import * as vscode from 'vscode';
import { WorkItemType } from '../work-item-type';
import { PreDefinedTask } from './pre-defined-task';
import { TaskTemplate, TaskTemplateSchema } from './task-template.schema';

/**
 * Service for loading task templates from JSON files.
 */
export class JsonTemplateLoader {
    private loadedTemplates: TaskTemplate[] = [];
    private templateSchemas = new Map<string, TaskTemplateSchema>();

    constructor(private context: vscode.ExtensionContext) {}

    /**
     * Load all templates from various sources.
     */
    async loadAllTemplates(): Promise<void> {
        // Load embedded templates first (defaults)
        await this.loadEmbeddedTemplates();
        
        // Load workspace templates (project-specific overrides)
        await this.loadWorkspaceTemplates();
        
        // Load extension pack templates
        await this.loadExtensionPackTemplates();
    }

    /**
     * Load templates from embedded JSON files in the extension.
     */
    async loadEmbeddedTemplates(): Promise<void> {
        const templatesPath = path.join(this.context.extensionPath, 'resources', 'task-templates', 'default');
        
        try {
            const templateFiles = [
                'planning-tasks.json',
                'development-tasks.json',
                'review-tasks.json',
                'qa-tasks.json',
                'release-tasks.json'
            ];

            for (const fileName of templateFiles) {
                const filePath = path.join(templatesPath, fileName);
                await this.loadTemplateFile(filePath, 'embedded');
            }
        } catch (error) {
            console.error('Failed to load embedded templates:', error);
        }
    }

    /**
     * Load templates from workspace .vscode folder.
     */
    async loadWorkspaceTemplates(): Promise<void> {
        if (!vscode.workspace.workspaceFolders) {
            return;
        }

        const config = vscode.workspace.getConfiguration('tacosontitan.toolbox');
        const customPath = config.get<string>('customTemplatesPath', '.vscode/task-templates');

        for (const workspaceFolder of vscode.workspace.workspaceFolders) {
            const templatesPath = path.join(workspaceFolder.uri.fsPath, customPath);
            
            try {
                const templateFiles = await vscode.workspace.fs.readDirectory(vscode.Uri.file(templatesPath));
                
                for (const [fileName, fileType] of templateFiles) {
                    if (fileType === vscode.FileType.File && fileName.endsWith('.json')) {
                        const filePath = path.join(templatesPath, fileName);
                        await this.loadTemplateFile(filePath, 'workspace');
                    }
                }
            } catch (error) {
                // Workspace templates are optional
                console.debug(`No workspace templates found in ${workspaceFolder.name}`);
            }
        }
    }

    /**
     * Load templates from extension packs.
     */
    async loadExtensionPackTemplates(): Promise<void> {
        const config = vscode.workspace.getConfiguration('tacosontitan.toolbox');
        const templateSources = config.get<string[]>('taskTemplateSources', []);

        for (const extensionId of templateSources) {
            try {
                const extension = vscode.extensions.getExtension(extensionId);
                if (extension) {
                    if (!extension.isActive) {
                        await extension.activate();
                    }
                    
                    const api = extension.exports;
                    if (api && api.getTaskTemplateFiles) {
                        const templateFiles = api.getTaskTemplateFiles();
                        for (const filePath of templateFiles) {
                            await this.loadTemplateFile(filePath, 'extension-pack');
                        }
                    }
                }
            } catch (error) {
                console.warn(`Failed to load templates from extension ${extensionId}:`, error);
            }
        }
    }

    /**
     * Load a single template file.
     */
    private async loadTemplateFile(filePath: string, source: string): Promise<void> {
        try {
            const fileUri = vscode.Uri.file(filePath);
            const content = await vscode.workspace.fs.readFile(fileUri);
            const jsonText = Buffer.from(content).toString('utf8');
            const schema: TaskTemplateSchema = JSON.parse(jsonText);

            // Validate schema
            if (!this.validateSchema(schema)) {
                throw new Error(`Invalid template schema in ${filePath}`);
            }

            // Store schema
            this.templateSchemas.set(filePath, schema);

            // Register templates with source information
            for (const template of schema.templates) {
                const enhancedTemplate = {
                    ...template,
                    metadata: {
                        ...template.metadata,
                        source,
                        sourceFile: path.basename(filePath)
                    }
                };
                this.loadedTemplates.push(enhancedTemplate);
            }

            console.log(`Loaded ${schema.templates.length} templates from ${path.basename(filePath)} (${source})`);
        } catch (error) {
            console.error(`Failed to load template file ${filePath}:`, error);
        }
    }

    /**
     * Validate a template schema.
     */
    private validateSchema(schema: any): schema is TaskTemplateSchema {
        if (!schema || typeof schema !== 'object') {
            return false;
        }
        if (typeof schema.version !== 'string') {
            return false;
        }
        if (!schema.metadata || typeof schema.metadata !== 'object') {
            return false;
        }
        if (typeof schema.metadata.name !== 'string') {
            return false;
        }
        if (!Array.isArray(schema.templates)) {
            return false;
        }

        // Validate each template
        for (const template of schema.templates) {
            if (!template.title || typeof template.title !== 'string') {
                return false;
            }
            if (typeof template.remainingWork !== 'number') {
                return false;
            }
            if (!Array.isArray(template.appliesTo)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get all loaded templates.
     */
    getAllTemplates(): TaskTemplate[] {
        return this.loadedTemplates;
    }

    /**
     * Get templates filtered by configuration settings.
     */
    getFilteredTemplates(): TaskTemplate[] {
        const config = vscode.workspace.getConfiguration('tacosontitan.toolbox');
        const enabledCategories = config.get<string[]>('enabledTemplateCategories', []);
        const disabledTemplateTitles = config.get<string[]>('disabledTaskTemplates', []);

        return this.getAllTemplates().filter(template => {
            // Filter by enabled categories
            if (enabledCategories.length > 0) {
                const category = template.metadata?.category || 'general';
                if (!enabledCategories.includes(category)) {
                    return false;
                }
            }

            // Filter out disabled templates (by title since we removed id)
            if (disabledTemplateTitles.includes(template.title)) {
                return false;
            }

            return true;
        });
    }

    /**
     * Get templates by category.
     */
    getTemplatesByCategory(category: string): TaskTemplate[] {
        return this.getFilteredTemplates().filter(t => 
            t.metadata?.category === category
        );
    }

    /**
     * Get template by title (since we removed id).
     */
    getTemplateByTitle(title: string): TaskTemplate | undefined {
        return this.loadedTemplates.find(template => template.title === title);
    }

    /**
     * Get templates that apply to a specific work item type.
     */
    getTemplatesForWorkItemType(workItemType: string): TaskTemplate[] {
        return this.getFilteredTemplates().filter(template => 
            template.appliesTo.includes(workItemType) || template.appliesTo.length === 0
        );
    }

    /**
     * Convert JSON templates to PreDefinedTask objects.
     */
    createPreDefinedTasks(filter?: (template: TaskTemplate) => boolean): PreDefinedTask[] {
        const templates = filter ? this.getFilteredTemplates().filter(filter) : this.getFilteredTemplates();
        
        return templates.map(template => ({
            id: undefined, // Will be set when created in Azure DevOps
            title: template.title,
            description: template.description,
            remainingWork: template.remainingWork,
            activity: template.activity,
            assigneeRequired: template.assigneeRequired,
            appliesTo: this.mapWorkItemTypes(template.appliesTo),
            requiredFields: template.requiredFields
        }));
    }

    /**
     * Convert string array to WorkItemType enum values.
     */
    private mapWorkItemTypes(types: string[]): WorkItemType[] {
        return types.map(type => {
            switch (type) {
                case 'Feature': return WorkItemType.Feature;
                case 'User Story': return WorkItemType.UserStory;
                case 'Bug': return WorkItemType.Bug;
                case 'Task': return WorkItemType.Task;
                default: return WorkItemType.Task;
            }
        });
    }

    /**
     * Get available categories from loaded templates.
     */
    getAvailableCategories(): string[] {
        const categories = new Set<string>();
        this.getAllTemplates().forEach(template => {
            if (template.metadata?.category) {
                categories.add(template.metadata.category);
            }
        });
        return Array.from(categories).sort();
    }

    /**
     * Get template statistics for diagnostics.
     */
    getLoadingStats(): { [source: string]: number } {
        const stats: { [source: string]: number } = {};
        this.getAllTemplates().forEach(template => {
            const source = template.metadata?.source || 'unknown';
            stats[source] = (stats[source] || 0) + 1;
        });
        return stats;
    }
}
