import { ICommandProvider } from "../../registration/command-provider";
import { IRegistrar } from "../../registration/registrar";
import { CreateDefaultTasksCommand } from "./workflow/create-default-tasks.command";

/**
 * Registers commands related to Azure DevOps operations.
 */
export class DevOpsRegistrar
	implements IRegistrar {
		
	/** @inheritdoc */
	public registerCommands(commands: ICommandProvider): void {
		commands.add(new CreateDefaultTasksCommand());
	}
}