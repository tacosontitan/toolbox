import { ExtensionContext } from "vscode";
import { TimeEntryService } from "../application/time/time-entry-service";
import { WorkflowService } from "../application/workflow/workflow.service";
import { ICommunicationService, IConfigurationProvider, ILogger, ISecretProvider, OutputLogger, ServiceLocator } from "../core";
import { ISourceControlService } from "../core/source-control/source-control.service";
import { DefaultTaskService } from "../domain/workflow";
import { JsonTemplateLoader } from "../domain/workflow/pre-defined-tasks/json-template-loader";
import { DevOpsService } from "../infrastructure/azure/devops-service";
import { WorkItemService } from "../infrastructure/azure/work-item.service";
import { GitService } from "../infrastructure/git/git.source-control.service";
import { NativeCommunicationService } from "../infrastructure/vscode/communication-service.native";
import { NativeConfigurationProvider } from "../infrastructure/vscode/configuration-provider.native";
import { NativeSecretProvider } from "../infrastructure/vscode/secret-provider.native";

export function registerServices(context: ExtensionContext) {
    registerInfrastructureServices(context);
    registerDomainServices();
    registerApplicationServices();
    ServiceLocator.registerFactory(ILogger, () =>  new OutputLogger("Hazel's Toolbox"));
    ServiceLocator.registerFactory(TimeEntryService, () =>  new TimeEntryService(context));
    ServiceLocator.registerFactory(JsonTemplateLoader, () => new JsonTemplateLoader(context));
}

function registerApplicationServices() {
    ServiceLocator.registerFactory(WorkflowService, () => new WorkflowService(
        ServiceLocator.getService(ILogger),
        ServiceLocator.getService('IConfiguration'),  // WorkflowOptions configuration
        ServiceLocator.getService('IRepository'),     // WorkItem repository
        ServiceLocator.getService('ITaskService')
    ));
    ServiceLocator.registerStringInterface('IWorkflowService', WorkflowService);
}

function registerDomainServices() {
    ServiceLocator.registerFactory(DefaultTaskService, () => new DefaultTaskService());
    ServiceLocator.registerStringInterface('ITaskService', DefaultTaskService);
}

function registerInfrastructureServices(context: ExtensionContext) {
    registerNativeServices(context);
    registerAzureServices();
    registerGitServices();
}

function registerNativeServices(context: ExtensionContext) {
    ServiceLocator.registerFactory(ISecretProvider, () => new NativeSecretProvider(context));
    ServiceLocator.registerFactory(IConfigurationProvider, () => new NativeConfigurationProvider());
    ServiceLocator.registerFactory(ICommunicationService, () => new NativeCommunicationService());
    ServiceLocator.registerFactory(IConfigurationProvider, () => new NativeConfigurationProvider());
}

function registerGitServices() {
    ServiceLocator.registerFactory(ISourceControlService, () => new GitService());
}

function registerAzureServices() {
    ServiceLocator.registerFactory(DevOpsService, () => new DevOpsService(
            ServiceLocator.getService(ISecretProvider),
            ServiceLocator.getService(IConfigurationProvider)
        )
    );

    ServiceLocator.registerFactory(WorkItemService, () => new WorkItemService(
            ServiceLocator.getService(ILogger),
            ServiceLocator.getService('ICommunicationService'),
            ServiceLocator.getService(DevOpsService)
        )
    );
}