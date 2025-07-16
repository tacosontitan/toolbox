import { ExtensionContext } from "vscode";
import { ICommunicationService, IConfigurationProvider, ILogger, ISecretProvider, OutputLogger, ServiceLocator } from "../core";
import { ISourceControlService } from "../core/source-control/source-control.service";
import { DevOpsService } from "../infrastructure/azure/devops-service";
import { WorkItemService } from "../infrastructure/azure/work-item.service";
import { GitService } from "../infrastructure/git/git.source-control.service";
import { NativeCommunicationService } from "../infrastructure/vscode/communication-service.native";
import { NativeConfigurationProvider } from "../infrastructure/vscode/configuration-provider.native";
import { NativeSecretProvider } from "../infrastructure/vscode/secret-provider.native";
import { TimeEntryService } from "../todo/time";

export function registerServices(context: ExtensionContext) {
    registerInfrastructureServices(context);
    ServiceLocator.registerFactory(ILogger, () =>  new OutputLogger("Hazel's Toolbox"));
    ServiceLocator.registerFactory(TimeEntryService, () =>  new TimeEntryService(context));
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