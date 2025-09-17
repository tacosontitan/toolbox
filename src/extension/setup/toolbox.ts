import { ExtensionContext } from "vscode";
import { ServiceLocator } from "../core/services";
import { TaskTemplateLoader } from "../domain/workflow/task-template-loader";

export async function initialize(context: ExtensionContext) {
	ServiceLocator.initialize(context);
	await loadDefaultTasks(context);
}

async function loadDefaultTasks(context: ExtensionContext) {
	const templateLoader = new TaskTemplateLoader(context);
	await templateLoader.loadTemplates();
}