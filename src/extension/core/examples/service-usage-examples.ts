import { ServiceLocator } from '../services/service-locator';

// Import abstract interfaces for abstraction-based consumption
import { IConfigurationProvider, ISecretProvider } from '../configuration';
import { ILogger } from '../telemetry';
import { LogLevel } from '../telemetry/log-level';

// Import concrete types for specific implementations (when needed)
import { DevOpsService } from '../../infrastructure/azure/devops-service';
import { OutputLogger } from '../telemetry';

/**
 * Examples of how to consume services through abstractions vs concrete types.
 * This demonstrates the new abstraction-based service resolution capability.
 */
export class ServiceUsageExamples {
    
    /**
     * Example: Consuming services through their abstractions (PREFERRED)
     * This approach makes code more testable and loosely coupled.
     */
    public static exampleAbstractionBasedConsumption(): void {
        // Request services through their abstractions
        const logger = ServiceLocator.getService(ILogger);
        const configProvider = ServiceLocator.getService(IConfigurationProvider);
        const secretProvider = ServiceLocator.getService(ISecretProvider);
        
        // Use the services through their interfaces
        logger.log(LogLevel.Information, 'Using abstraction-based service resolution');
        
        // For TypeScript interfaces, use string tokens
        const communicationService = ServiceLocator.getService('ICommunicationService');
        // communicationService.confirm('Are you sure?');
    }
    
    /**
     * Example: Consuming services through concrete types (WHEN NEEDED)
     * Use this approach only when you need specific implementation features.
     */
    public static exampleConcreteTypeConsumption(): void {
        // Request specific concrete implementations
        const outputLogger = ServiceLocator.getService(OutputLogger);
        const devopsService = ServiceLocator.getService(DevOpsService);
        
        // Access implementation-specific features
        outputLogger.open(); // This method might not be on ILogger
        
        // Use business services (these don't typically have abstractions)
        // const workItems = devopsService.getWorkItems();
    }
    
    /**
     * Example: How to structure a service that consumes other services
     * Demonstrates dependency injection through constructor parameters.
     */
    public static exampleServiceWithDependencies(): void {
        // This is how services should be created in ServiceLocator factories
        
        class ExampleBusinessService {
            constructor(
                private logger: ILogger,
                private configProvider: IConfigurationProvider,
                private secretProvider: ISecretProvider
            ) {}
            
            public async doSomething(): Promise<void> {
                this.logger.log(LogLevel.Information, 'Starting business operation');
                
                const config = await this.configProvider.get<string>('some-setting');
                const secret = await this.secretProvider.get<string>('api-key');
                
                // Business logic here...
                
                this.logger.log(LogLevel.Information, 'Business operation completed');
            }
        }
        
        // Register the service factory (this would be in toolbox.ts)
        ServiceLocator.registerFactory(ExampleBusinessService, () => {
            return new ExampleBusinessService(
                ServiceLocator.getService(ILogger),           // Abstraction
                ServiceLocator.getService(IConfigurationProvider), // Abstraction  
                ServiceLocator.getService(ISecretProvider)    // Abstraction
            );
        });
        
        // Consume the service
        const businessService = ServiceLocator.getService(ExampleBusinessService);
        businessService.doSomething();
    }
}
