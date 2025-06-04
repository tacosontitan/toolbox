import * as PreDefinedTasks from './pre-defined-tasks';
import { PreDefinedTask } from "./pre-defined-tasks/pre-defined-task";

/**
 * Defines the default tasks used to execute a work item in an Agile workflow.
 */
export const DefaultTasks: PreDefinedTask[] = [
    PreDefinedTasks.ReviewWorkItem,
    PreDefinedTasks.ReproduceLocally,
    PreDefinedTasks.ReviewExistingImplementations,
    PreDefinedTasks.MeetWithProductOwners,
    PreDefinedTasks.MeetWithStakeholders,
    PreDefinedTasks.MeetWithQualityAssurance,
    PreDefinedTasks.QAWriteTestCases,
    PreDefinedTasks.QAReviewTestCases,
    PreDefinedTasks.DevReviewTestCases,
    PreDefinedTasks.CreateImplementationTasks,
    PreDefinedTasks.SetupEnvironment,
    PreDefinedTasks.CreateDraftPR,
    PreDefinedTasks.SelfReviewPR,
    PreDefinedTasks.PublishPR,
    PreDefinedTasks.CreateQualityAssuranceBuild,
    PreDefinedTasks.QADeploymentToTestEnvironment,
    PreDefinedTasks.QATestCaseExecution,
    PreDefinedTasks.SupportQATesting,
    PreDefinedTasks.ResolvePRFeedback,
    PreDefinedTasks.RunPRValidations,
    PreDefinedTasks.CompletePR,
    PreDefinedTasks.CreateReleaseBuild,
    PreDefinedTasks.CreateReleaseNotes,
    PreDefinedTasks.QAReviewReleaseNotes,
    PreDefinedTasks.QASmokeTesting,
    PreDefinedTasks.SupportSmokeTesting,
    PreDefinedTasks.DeployToProduction,
    PreDefinedTasks.NotifyStakeholdersOfDeployment,
    PreDefinedTasks.ValidateInProduction
];