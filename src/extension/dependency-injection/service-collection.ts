/**
 * @fileoverview Implementation of the service collection for dependency injection.
 * Handles type-safe service registration and delegates to string-based internals.
 */

import { IServiceCollection } from './service-collection.interface';
import { ServiceDescriptor } from './service-descriptor';
import { ServiceLifetime } from './service-lifetime';
import { ServiceProvider } from './service-provider';
import { IServiceProvider } from './service-provider.interface';
import { ServiceTokenRegistry } from './service-token-registry';
import { Constructor, ServiceType } from './types';

/**
 * Implementation of service collection that provides type-safe service registration.
 * Uses TypeScript types as service identifiers and converts them to string tokens internally.
 */
export class ServiceCollection implements IServiceCollection {
    private readonly services: ServiceDescriptor[] = [];

    /**
     * @inheritdoc
     */
    addTransient<T>(
        serviceType: ServiceType<T>,
        implementation?: Constructor<T> | ((provider: IServiceProvider) => T)
    ): IServiceCollection {
        const token = ServiceTokenRegistry.getTypeToken(serviceType);
        
        if (!implementation) {
            // Use the service type as implementation if it's a concrete class
            const concreteType = serviceType as Constructor<T>;
            this.services.push({
                serviceType: token,
                implementationType: concreteType,
                lifetime: ServiceLifetime.Transient
            });
        } else if (this.isConstructor(implementation)) {
            this.services.push({
                serviceType: token,
                implementationType: implementation,
                lifetime: ServiceLifetime.Transient
            });
        } else {
            this.services.push({
                serviceType: token,
                implementationFactory: implementation,
                lifetime: ServiceLifetime.Transient
            });
        }
        return this;
    }

    /**
     * @inheritdoc
     */
    addSingleton<T>(
        serviceType: ServiceType<T>,
        implementation?: Constructor<T> | ((provider: IServiceProvider) => T) | T
    ): IServiceCollection {
        const token = ServiceTokenRegistry.getTypeToken(serviceType);
        
        if (!implementation) {
            // Use the service type as implementation if it's a concrete class
            const concreteType = serviceType as Constructor<T>;
            this.services.push({
                serviceType: token,
                implementationType: concreteType,
                lifetime: ServiceLifetime.Singleton
            });
        } else if (this.isConstructor(implementation)) {
            this.services.push({
                serviceType: token,
                implementationType: implementation,
                lifetime: ServiceLifetime.Singleton
            });
        } else if (typeof implementation === 'function') {
            // Check if it's a factory function or a constructor
            if (this.isConstructor(implementation)) {
                this.services.push({
                    serviceType: token,
                    implementationType: implementation,
                    lifetime: ServiceLifetime.Singleton
                });
            } else {
                this.services.push({
                    serviceType: token,
                    implementationFactory: implementation as (provider: any) => T,
                    lifetime: ServiceLifetime.Singleton
                });
            }
        } else {
            this.services.push({
                serviceType: token,
                implementationInstance: implementation,
                lifetime: ServiceLifetime.Singleton
            });
        }
        return this;
    }

    /**
     * @inheritdoc
     */
    addScoped<T>(
        serviceType: ServiceType<T>,
        implementation?: Constructor<T> | ((provider: IServiceProvider) => T)
    ): IServiceCollection {
        const token = ServiceTokenRegistry.getTypeToken(serviceType);
        
        if (!implementation) {
            // Use the service type as implementation if it's a concrete class
            const concreteType = serviceType as Constructor<T>;
            this.services.push({
                serviceType: token,
                implementationType: concreteType,
                lifetime: ServiceLifetime.Scoped
            });
        } else if (this.isConstructor(implementation)) {
            this.services.push({
                serviceType: token,
                implementationType: implementation,
                lifetime: ServiceLifetime.Scoped
            });
        } else {
            this.services.push({
                serviceType: token,
                implementationFactory: implementation,
                lifetime: ServiceLifetime.Scoped
            });
        }
        return this;
    }

    /**
     * @inheritdoc
     */
    buildServiceProvider(): IServiceProvider {
        return new ServiceProvider(this.services);
    }

    /**
     * Type guard to check if a value is a constructor function.
     * @param value The value to check
     * @returns True if the value is a constructor function
     */
    private isConstructor<T>(value: any): value is Constructor<T> {
        return typeof value === 'function' && value.prototype !== undefined;
    }
}
