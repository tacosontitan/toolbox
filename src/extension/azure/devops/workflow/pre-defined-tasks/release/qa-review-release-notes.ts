import { PreDefinedTask } from "../pre-defined-task";

/**
 * Represents a pre-defined task for quality assurance to review release notes in Azure DevOps.
 */
export const QAReviewReleaseNotes: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 0.5,
    assigneeRequired: false,
    name: 'QA Review Release Notes',
    activity: 'Requirements',
    description: 'Review the release notes to ensure accuracy and completeness.'
};
