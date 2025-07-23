/**
 * Schema definition for task template JSON files.
 */
export interface TaskTemplateSchema {
    $schema?: string;
    version: string;
    metadata: {
        name: string;
        description: string;
        author: string;
    };
    templates: TaskTemplate[];
}

/**
 * Represents a task template loaded from JSON.
 */
export interface TaskTemplate {
    /**
     * The title of the task.
     */
    title: string;

    /**
     * The description of the task.
     */
    description: string;

    /**
     * The number of hours the task is estimated to take.
     */
    remainingWork: number;

    /**
     * The activity associated with the task.
     */
    activity: string;

    /**
     * The fields that must have values for the task to be created.
     */
    requiredFields?: string[];

    /**
     * The WorkItemType names to which the task applies.
     * This can be in either the root level or metadata for backward compatibility.
     */
    appliesTo?: string[];

    /**
     * Additional metadata for the template.
     */
    metadata?: {
        /**
         * The WorkItemType names to which the task applies.
         */
        appliesTo?: string[];
        
        /**
         * Indicates whether the task should have an assignee by default.
         */
        assigneeRequired?: boolean;
        
        /**
         * The category of this template (e.g., "development", "planning").
         */
        category?: string;
        
        [key: string]: any;
    };
}
