import { ExtensionContext } from "vscode";
import { ServiceLocator } from "../core/services";

export function initialize(context: ExtensionContext) {
	// Initialize the service locator with extension context
	ServiceLocator.initialize(context);
}

