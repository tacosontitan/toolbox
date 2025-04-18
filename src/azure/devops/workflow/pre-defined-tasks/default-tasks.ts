import * as PreDefinedTasks from '../pre-defined-tasks';
import { PreDefinedTask } from "../pre-defined-task";

/**
 * Defines the default tasks used to execute a work item in an Agile workflow.
 */
export const DefaultTasks: PreDefinedTask[] = [
    PreDefinedTasks.ReviewPreDefinedTasks,
    PreDefinedTasks.ReviewPBI,
    PreDefinedTasks.ReproduceLocally,
    PreDefinedTasks.ReviewExistingImplementations,
    PreDefinedTasks.MeetWithProductOwners,
    PreDefinedTasks.MeetWithStakeholders,
    PreDefinedTasks.MeetWithQA,
    PreDefinedTasks.QAWriteTestCases,
    PreDefinedTasks.QAReviewTestCases,
    PreDefinedTasks.DevReviewTestCases,
    PreDefinedTasks.CreateImplementationTasks,
    PreDefinedTasks.SetupEnvironment,
    PreDefinedTasks.CreateDraftPR,
    PreDefinedTasks.SelfReviewPR,
    PreDefinedTasks.PublishPR,
    PreDefinedTasks.CreateQABuild,
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