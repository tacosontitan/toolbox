import { ExtensionContext } from "vscode";
import { TimeEntryService } from "../application/time/time-entry-service";
import { WorkflowService } from "../application/workflow/workflow.service";
import { ICommunicationService, IConfiguration, IConfigurationProvider, ILogger, ISecretProvider, OutputLogger, ServiceLocator } from "../core";
import { IRepository } from "../core/repository";
import { ISourceControlService } from "../core/source-control/source-control.service";
import { DefaultTaskService, ITaskService, WorkflowConfiguration, WorkflowOptions, WorkItem } from "../domain/workflow";
import { JsonTemplateLoader } from "../domain/workflow/pre-defined-tasks/json-template-loader";
import { DevOpsService } from "../infrastructure/azure/devops-service";
import { DevOpsConfiguration } from "../infrastructure/azure/devops.configuration";
import { DevOpsOptions } from "../infrastructure/azure/devops.options";
import { AzureDevOpsWorkItemRepository } from "../infrastructure/azure/work-item-repository";
import { WorkItemService } from "../infrastructure/azure/work-item.service";
import { GitService } from "../infrastructure/git/git.source-control.service";
import { NativeCommunicationService } from "../infrastructure/vscode/communication-service.native";
import { NativeConfigurationProvider } from "../infrastructure/vscode/configuration-provider.native";
import { NativeSecretProvider } from "../infrastructure/vscode/secret-provider.native";
import { NativeTaskService } from "../infrastructure/vscode/task-service.native";

export function registerServices(context: ExtensionContext) {
    registerInfrastructureServices(context);
    registerDomainServices();
    registerApplicationServices();
    ServiceLocator.registerFactory(ILogger, () =>  new OutputLogger("Hazel's Toolbox"));
    ServiceLocator.registerFactory(TimeEntryService, () =>  new TimeEntryService(context));
    ServiceLocator.registerFactory(JsonTemplateLoader, () => new JsonTemplateLoader(context));
}

function registerInfrastructureServices(context: ExtensionContext) {
    registerNativeServices(context);
    registerAzureServices();
    registerGitServices();
}

function registerDomainServices() {
    ServiceLocator.registerFactory(DefaultTaskService, () => new DefaultTaskService());
    ServiceLocator.registerStringInterface('ITaskService', DefaultTaskService);
}

function registerApplicationServices() {
    ServiceLocator.registerFactory(IConfiguration<WorkflowOptions>, () => new WorkflowConfiguration(
        ServiceLocator.getService(ILogger),
        ServiceLocator.getService(IConfigurationProvider)
    ));

    ServiceLocator.registerFactory(IRepository<WorkItem>, () => new AzureDevOpsWorkItemRepository(
        ServiceLocator.getService(ILogger),
        ServiceLocator.getService(IConfiguration<DevOpsOptions>)
    ));

    ServiceLocator.registerFactory(WorkflowService, () => new WorkflowService(
        ServiceLocator.getService(ILogger),
        ServiceLocator.getService(IConfiguration<WorkflowOptions>),
        ServiceLocator.getService(IRepository<WorkItem>),
        ServiceLocator.getService(ITaskService)
    ));

    ServiceLocator.registerStringInterface('IWorkflowService', WorkflowService);
}

function registerNativeServices(context: ExtensionContext) {
    ServiceLocator.registerFactory(ISecretProvider, () => new NativeSecretProvider(context));
    ServiceLocator.registerFactory(IConfigurationProvider, () => new NativeConfigurationProvider());
    ServiceLocator.registerFactory(ICommunicationService, () => new NativeCommunicationService());
    ServiceLocator.registerFactory(IConfigurationProvider, () => new NativeConfigurationProvider());
    ServiceLocator.registerFactory(ITaskService, () => new NativeTaskService());
}

function registerGitServices() {
    ServiceLocator.registerFactory(ISourceControlService, () => new GitService());
}

function registerAzureServices() {
    ServiceLocator.registerFactory(IConfiguration<DevOpsOptions>, () => new DevOpsConfiguration(
        ServiceLocator.getService(ILogger),
        ServiceLocator.getService(IConfigurationProvider),
        ServiceLocator.getService(ISecretProvider)
    ));

    ServiceLocator.registerFactory(DevOpsService, () => new DevOpsService(
            ServiceLocator.getService(ISecretProvider),
            ServiceLocator.getService(IConfigurationProvider)
        )
    );

    ServiceLocator.registerFactory(WorkItemService, () => new WorkItemService(
            ServiceLocator.getService(ILogger),
            ServiceLocator.getService(ICommunicationService),
            ServiceLocator.getService(DevOpsService)
        )
    );
}