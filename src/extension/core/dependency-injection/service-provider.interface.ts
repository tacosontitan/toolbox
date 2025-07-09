/**
 * @fileoverview Service provider interface for dependency resolution.
 * Provides contracts for resolving services from the DI container.
 */

import { IServiceResolver } from "./service-resolver.interface";
import { IServiceScope } from "./service-scope.interface";

/**
 * Interface for resolving services from the dependency injection container.
 * Extends the base resolver with scope creation capabilities.
 */
export interface IServiceProvider extends IServiceResolver {
    /**
     * Creates a new service scope for scoped service lifetime management.
     * Services registered as scoped will have one instance per scope.
     * @returns A new service scope
     */
    createScope(): IServiceScope;
}