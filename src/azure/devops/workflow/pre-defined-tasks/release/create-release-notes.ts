import { PreDefinedTask } from "../pre-defined-task";

/**
 * Represents a pre-defined task to create release notes in Azure DevOps.
 */
export const CreateReleaseNotes: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 0.25,
    name: 'Create Release Notes',
    description: 'Draft release notes to document the changes and updates included in the release.'
};
