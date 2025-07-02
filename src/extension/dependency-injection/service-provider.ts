/**
 * @fileoverview Implementation of the service provider for dependency resolution.
 * Handles type-safe service resolution and delegates to string-based internals.
 */

import { ServiceDescriptor } from "./service-descriptor";
import { ServiceLifetime } from "./service-lifetime";
import { IServiceProvider } from "./service-provider.interface";
import { ServiceScope } from "./service-scope";
import { IServiceScope } from "./service-scope.interface";
import { ServiceTokenRegistry } from "./service-token-registry";
import { ServiceType } from "./types";

/**
 * Implementation of service provider that provides type-safe service resolution.
 * Uses TypeScript types as service identifiers and converts them to string tokens internally.
 */
export class ServiceProvider implements IServiceProvider {
    private readonly singletonInstances = new Map<string, any>();

    constructor(private readonly services: ServiceDescriptor[]) {}

    /**
     * @inheritdoc
     */
    getService<T>(serviceType: ServiceType<T>): T | undefined {
        try {
            return this.getRequiredService<T>(serviceType);
        } catch {
            return undefined;
        }
    }

    /**
     * @inheritdoc
     */
    getRequiredService<T>(serviceType: ServiceType<T>): T {
        const token = ServiceTokenRegistry.getTypeToken(serviceType);
        const descriptor = this.findService(token);
        if (!descriptor) {
            throw new Error(`Service of type '${serviceType.name || token}' is not registered.`);
        }

        return this.createInstance<T>(descriptor);
    }

    /**
     * @inheritdoc
     */
    createScope(): IServiceScope {
        return new ServiceScope(this.services);
    }

    private findService(serviceType: string): ServiceDescriptor | undefined {
        // Find the last registered service (allows overriding)
        for (let i = this.services.length - 1; i >= 0; i--) {
            if (this.services[i].serviceType === serviceType) {
                return this.services[i];
            }
        }
        return undefined;
    }

    private createInstance<T>(descriptor: ServiceDescriptor<T>): T {
        if (descriptor.lifetime === ServiceLifetime.Singleton) {
            if (this.singletonInstances.has(descriptor.serviceType)) {
                return this.singletonInstances.get(descriptor.serviceType);
            }
        }

        let instance: T;

        if (descriptor.implementationInstance !== undefined) {
            instance = descriptor.implementationInstance;
        } else if (descriptor.implementationFactory) {
            instance = descriptor.implementationFactory(this);
        } else if (descriptor.implementationType) {
            instance = new descriptor.implementationType();
        } else {
            throw new Error(`No implementation found for service '${descriptor.serviceType}'.`);
        }

        if (descriptor.lifetime === ServiceLifetime.Singleton) {
            this.singletonInstances.set(descriptor.serviceType, instance);
        }

        return instance;
    }
}
