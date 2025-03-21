import { ICommandProvider } from "../registration/command-provider";
import { IRegistrar } from "../registration/registrar";
import { DevOpsRegistrar } from "./devops/devops.registrar";

/**
 * Registers commands related to Azure operations.
 */
export class AzureRegistrar
	implements IRegistrar {
	private readonly children: IRegistrar[] = [
		new DevOpsRegistrar()
	];
	
	/** @inheritdoc */
	public registerCommands(commands: ICommandProvider): void {
		for (const child of this.children) {
			child.registerCommands(commands);
		}
	}
}