import { PreDefinedTask } from "../../pre-defined-task";

/**
 * Represents a pre-defined task for creating a quality assurance build in Azure DevOps.
 */
export const CreateQualityAssuranceBuild: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 0.01,
    name: 'Create Quality Assurance Build',
    description: 'Create a build for QA testing to validate the implementation.'
};
