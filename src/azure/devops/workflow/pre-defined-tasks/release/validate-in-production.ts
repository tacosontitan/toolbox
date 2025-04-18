import { PreDefinedTask } from "../../pre-defined-task";

/**
 * Represents a pre-defined task for validating the functionality of the deployed build in the production environment in Azure DevOps.
 */
export const ValidateInProduction: PreDefinedTask = {
    id: undefined,
    appliesTo: [],
    remainingWork: 0.5,
    name: 'Validate in Production',
    description: 'Validate the functionality of the deployed build in the production environment.'
};
