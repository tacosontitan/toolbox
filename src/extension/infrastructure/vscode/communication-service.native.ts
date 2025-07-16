import { window } from "vscode";
import { ICommunicationService } from "../../core/communication/communication-service.interface";

export class NativeCommunicationService implements ICommunicationService {
    public async prompt<TResult>(message: string): Promise<TResult> {
        const response = await window.showInputBox({ prompt: message });
        return response as TResult;
    }

    public async confirm(message: string): Promise<boolean> {
        const response = await window.showInformationMessage(message, "Yes", "No");
        return response === "Yes";
    }
}