/**
 * @fileoverview Implementation of service scope for scoped service lifetime management.
 * Handles type-safe service resolution within a specific scope.
 */

import { ServiceDescriptor } from "./service-descriptor";
import { ServiceLifetime } from "./service-lifetime";
import { ServiceProvider } from "./service-provider";
import { IServiceScope } from "./service-scope.interface";
import { ServiceTokenRegistry } from "./service-token-registry";
import { ServiceType } from "./types";

/**
 * Implementation of service scope that provides type-safe scoped service resolution.
 * Uses TypeScript types as service identifiers and converts them to string tokens internally.
 */
export class ServiceScope implements IServiceScope {
    private readonly scopedInstances = new Map<string, any>();
    private readonly serviceProvider: ServiceProvider;

    constructor(services: ServiceDescriptor[]) {
        this.serviceProvider = new ServiceProvider(services);
    }

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

        if (descriptor.lifetime === ServiceLifetime.Scoped) {
            if (this.scopedInstances.has(descriptor.serviceType)) {
                return this.scopedInstances.get(descriptor.serviceType);
            }
        }

        const instance = this.createInstance<T>(descriptor);

        if (descriptor.lifetime === ServiceLifetime.Scoped) {
            this.scopedInstances.set(descriptor.serviceType, instance);
        }

        return instance;
    }

    /**
     * @inheritdoc
     */
    createScope(): IServiceScope {
        return new ServiceScope(this.serviceProvider['services']);
    }

    /**
     * @inheritdoc
     */
    dispose(): void {
        this.scopedInstances.clear();
    }

    private findService(serviceType: string): ServiceDescriptor | undefined {
        const services = this.serviceProvider['services'] as ServiceDescriptor[];
        for (let i = services.length - 1; i >= 0; i--) {
            if (services[i].serviceType === serviceType) {
                return services[i];
            }
        }
        return undefined;
    }

    private createInstance<T>(descriptor: ServiceDescriptor<T>): T {
        if (descriptor.implementationInstance !== undefined) {
            return descriptor.implementationInstance;
        } else if (descriptor.implementationFactory) {
            return descriptor.implementationFactory(this);
        } else if (descriptor.implementationType) {
            return new descriptor.implementationType();
        } else {
            throw new Error(`No implementation found for service '${descriptor.serviceType}'.`);
        }
    }
}
