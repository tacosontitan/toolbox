import { ExtensionContext } from "vscode";
import { ServiceLocator } from "../core/services";
import { initializeDefaultTasks } from "../domain/workflow/default-tasks";

export function initialize(context: ExtensionContext) {
	// Initialize the service locator with extension context
	ServiceLocator.initialize(context);
}

export async function initializeTemplates() {
	// Initialize the default tasks from JSON templates
	await initializeDefaultTasks();
}

