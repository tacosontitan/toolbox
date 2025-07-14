import * as vscode from 'vscode';
import { ICommunicationService, NativeCommunicationService } from '../communication';
import { IConfigurationProvider, ISecretProvider, NativeConfigurationProvider, NativeSecretProvider } from '../configuration';
import { GitService } from '../source-control/git.service';
import { ILogger, LogLevel, OutputLogger } from '../telemetry';
import { IWorkItemService, IWorkItemDataService } from '../workflow';
import { AzureDevOpsWorkItemDataService } from '../workflow/azure-devops-work-item-data.service';
import { DevOpsService } from '../../azure/devops/devops-service';
import { AzureDevOpsWorkItemService } from '../../azure/devops/workflow/azure.devops.work-item.service';

/**
 * Service container that provides dependency injection for the extension.
 * Centralizes service creation and manages dependencies.
 */
export class ServiceContainer {
    private static _instance: ServiceContainer;
    private readonly _services = new Map<string, any>();

    private constructor(private readonly context: vscode.ExtensionContext) {
        this.registerCoreServices();
    }

    /**
     * Gets the singleton instance of the service container.
     */
    public static getInstance(context?: vscode.ExtensionContext): ServiceContainer {
        if (!ServiceContainer._instance) {
            if (!context) {
                throw new Error('ServiceContainer must be initialized with context first');
            }
            ServiceContainer._instance = new ServiceContainer(context);
        }
        return ServiceContainer._instance;
    }

    /**
     * Registers core services with the container.
     */
    private registerCoreServices(): void {
        // Core services
        this.registerSingleton<ILogger>('logger', () => new OutputLogger("Hazel's Toolbox"));
        this.registerSingleton<ICommunicationService>('communicationService', () => new NativeCommunicationService());
        this.registerSingleton<ISecretProvider>('secretProvider', () => new NativeSecretProvider(this.context));
        this.registerSingleton<IConfigurationProvider>('configurationProvider', () => new NativeConfigurationProvider());
        this.registerSingleton<GitService>('gitService', () => new GitService());

        // Azure DevOps services
        this.registerSingleton<DevOpsService>('devOpsService', () => {
            const secretProvider = this.get<ISecretProvider>('secretProvider');
            const configurationProvider = this.get<IConfigurationProvider>('configurationProvider');
            return new DevOpsService(secretProvider, configurationProvider);
        });

        this.registerSingleton<IWorkItemDataService>('workItemDataService', () => {
            const devOpsService = this.get<DevOpsService>('devOpsService');
            return new AzureDevOpsWorkItemDataService(devOpsService);
        });

        this.registerSingleton<IWorkItemService>('workItemService', () => {
            const logger = this.get<ILogger>('logger');
            const communicationService = this.get<ICommunicationService>('communicationService');
            const devOpsService = this.get<DevOpsService>('devOpsService');
            return new AzureDevOpsWorkItemService(logger, communicationService, devOpsService);
        });
    }

    /**
     * Registers a singleton service with the container.
     */
    public registerSingleton<T>(key: string, factory: () => T): void {
        this._services.set(key, { factory, singleton: true, instance: null });
    }

    /**
     * Registers a transient service with the container.
     */
    public registerTransient<T>(key: string, factory: () => T): void {
        this._services.set(key, { factory, singleton: false, instance: null });
    }

    /**
     * Gets a service from the container.
     */
    public get<T>(key: string): T {
        const serviceDescriptor = this._services.get(key);
        if (!serviceDescriptor) {
            throw new Error(`Service '${key}' not registered`);
        }

        if (serviceDescriptor.singleton) {
            if (!serviceDescriptor.instance) {
                serviceDescriptor.instance = serviceDescriptor.factory();
            }
            return serviceDescriptor.instance;
        } else {
            return serviceDescriptor.factory();
        }
    }

    /**
     * Checks if a service is registered.
     */
    public has(key: string): boolean {
        return this._services.has(key);
    }
}