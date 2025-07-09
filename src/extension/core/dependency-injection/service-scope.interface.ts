/**
 * @fileoverview Service scope interface for scoped service lifetime management.
 * Extends service resolver with disposal capabilities for scoped services.
 */

import { IServiceResolver } from "./service-resolver.interface";

/**
 * Interface for managing scoped services within a specific lifetime scope.
 * Extends IServiceResolver with disposal capabilities for cleanup.
 */
export interface IServiceScope extends IServiceResolver {
    /**
     * Disposes of all scoped services created within this scope.
     * Should be called when the scope is no longer needed to prevent memory leaks.
     */
    dispose(): void;
}