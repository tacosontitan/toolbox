import * as azdev from 'azure-devops-node-api';
import * as vscode from 'vscode';
import { getMeetingTemplate, getMeetingTypes } from '../../todo/meetings/meeting-templates';
import { getConfiguredParticipants } from '../../todo/meetings/participant-config';
import { DevOpsService } from '../todo/services/devops-service';

export class MeetingViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'meetingView';

    private _view?: vscode.WebviewView;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly devOpsService: DevOpsService
    ) { }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'templateSelected':
                    {
                        const template = getMeetingTemplate(data.meetingType, data.selectedParticipants || []);
                        webviewView.webview.postMessage({
                            type: 'updateTemplate',
                            template: template
                        });
                        break;
                    }
                case 'participantsChanged':
                    {
                        // Regenerate template with new participants if a meeting type is selected
                        const meetingTypeElement = data.meetingType;
                        if (meetingTypeElement) {
                            const template = getMeetingTemplate(meetingTypeElement, data.selectedParticipants || []);
                            webviewView.webview.postMessage({
                                type: 'updateTemplate',
                                template: template
                            });
                        }
                        break;
                    }
                case 'sendNotes':
                    {
                        this.sendNotesToWorkItem(data.workItemId, data.notes);
                        break;
                    }
            }
        });
    }

    private async sendNotesToWorkItem(workItemId: string, notes: string) {
        try {
            const id = parseInt(workItemId);
            if (isNaN(id)) {
                vscode.window.showErrorMessage('Please enter a valid work item ID.');
                return;
            }

            // Add the meeting notes as a comment to the work item
            await this.addCommentToWorkItem(id, notes);

            vscode.window.showInformationMessage(`Meeting notes successfully added to work item #${id}`);

            // Clear the form
            if (this._view) {
                this._view.webview.postMessage({
                    type: 'clearForm'
                });
            }
        } catch (error: any) {
            vscode.window.showErrorMessage(`Failed to send meeting notes: ${error.message}`);
        }
    }

    private async addCommentToWorkItem(workItemId: number, comment: string) {
        // Get the Azure DevOps connection
        const pat = await this.devOpsService.getPersonalAccessToken();
        const organizationUri = await this.devOpsService.getOrganizationUri();
        const projectName = await this.devOpsService.getProjectName();

        if (!pat || !organizationUri || !projectName) {
            throw new Error('Azure DevOps configuration is incomplete');
        }
        const authHandler = azdev.getPersonalAccessTokenHandler(pat);
        const connection = new azdev.WebApi(organizationUri, authHandler);
        const workItemTrackingApi = await connection.getWorkItemTrackingApi();

        // Add comment using work item update patch operation
        const patchDocument = [
            {
                op: 'add',
                path: '/fields/System.History',
                value: comment
            }
        ];

        await workItemTrackingApi.updateWorkItem(null, patchDocument, workItemId, projectName);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const meetingTypes = getMeetingTypes();
        const meetingOptionsHtml = meetingTypes.map(type =>
            `<option value="${type}">${type.charAt(0).toUpperCase() + type.slice(1)}</option>`
        ).join('');

        const participants = getConfiguredParticipants();
        const participantsHtml = participants.map(participant =>
            `<label class="participant-checkbox">
                <input type="checkbox" value="${participant}" onchange="updateParticipants()">
                ${participant}
            </label>`
        ).join('');

        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Meeting Notes</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    font-size: var(--vscode-font-size);
                    font-weight: var(--vscode-font-weight);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    padding: 10px;
                    margin: 0;
                }
                
                .form-group {
                    margin-bottom: 15px;
                }
                
                label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: bold;
                }
                
                select, input, textarea {
                    width: 100%;
                    padding: 6px;
                    font-family: var(--vscode-font-family);
                    font-size: var(--vscode-font-size);
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 2px;
                    box-sizing: border-box;
                }
                
                select:focus, input:focus, textarea:focus {
                    outline: none;
                    border-color: var(--vscode-focusBorder);
                }
                
                textarea {
                    min-height: 300px;
                    resize: vertical;
                    font-family: 'Courier New', monospace;
                }
                
                button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 8px 16px;
                    font-size: var(--vscode-font-size);
                    cursor: pointer;
                    border-radius: 2px;
                    width: 100%;
                }
                
                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                
                button:disabled {
                    background-color: var(--vscode-button-secondaryBackground);
                    color: var(--vscode-button-secondaryForeground);
                    cursor: not-allowed;
                }
                
                .work-item-input {
                    display: flex;
                    gap: 10px;
                    align-items: end;
                }
                
                .work-item-input input {
                    flex: 1;
                }
                
                .work-item-input button {
                    width: auto;
                    flex-shrink: 0;
                }
                
                .participants-section {
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 2px;
                    padding: 10px;
                    max-height: 150px;
                    overflow-y: auto;
                    background-color: var(--vscode-input-background);
                }
                
                .participant-checkbox {
                    display: block;
                    margin-bottom: 8px;
                    cursor: pointer;
                    font-size: var(--vscode-font-size);
                    color: var(--vscode-input-foreground);
                }
                
                .participant-checkbox input[type="checkbox"] {
                    margin-right: 8px;
                    width: auto;
                }
            </style>
        </head>
        <body>
            <div class="form-group">
                <label for="meetingType">Meeting Type:</label>
                <select id="meetingType">
                    <option value="">Select meeting type...</option>
                    ${meetingOptionsHtml}
                </select>
            </div>
            
            <div class="form-group">
                <label>Participants:</label>
                <div class="participants-section">
                    ${participantsHtml}
                </div>
            </div>
            
            <div class="form-group">
                <label for="meetingNotes">Meeting Notes:</label>
                <textarea id="meetingNotes" placeholder="Select a meeting type to load a template, or start typing your notes..."></textarea>
            </div>
            
            <div class="form-group">
                <label for="workItemId">Work Item ID:</label>
                <div class="work-item-input">
                    <input type="number" id="workItemId" placeholder="Enter work item ID..." min="1">
                    <button id="sendButton" onclick="sendNotes()" disabled>Send to Work Item</button>
                </div>
            </div>
            
            <script>
                const vscode = acquireVsCodeApi();
                
                document.getElementById('meetingType').addEventListener('change', function(e) {
                    updateTemplate();
                    updateSendButton();
                });
                
                function updateParticipants() {
                    updateTemplate();
                }
                
                function updateTemplate() {
                    const meetingType = document.getElementById('meetingType').value;
                    if (meetingType) {
                        const selectedParticipants = getSelectedParticipants();
                        vscode.postMessage({
                            type: 'templateSelected',
                            meetingType: meetingType,
                            selectedParticipants: selectedParticipants
                        });
                    }
                }
                
                function getSelectedParticipants() {
                    const checkboxes = document.querySelectorAll('.participant-checkbox input[type="checkbox"]:checked');
                    return Array.from(checkboxes).map(checkbox => checkbox.value);
                }
                
                document.getElementById('meetingNotes').addEventListener('input', updateSendButton);
                document.getElementById('workItemId').addEventListener('input', updateSendButton);
                
                function updateSendButton() {
                    const notes = document.getElementById('meetingNotes').value.trim();
                    const workItemId = document.getElementById('workItemId').value.trim();
                    const sendButton = document.getElementById('sendButton');
                    
                    sendButton.disabled = !notes || !workItemId;
                }
                
                function sendNotes() {
                    const notes = document.getElementById('meetingNotes').value.trim();
                    const workItemId = document.getElementById('workItemId').value.trim();
                    
                    if (!notes || !workItemId) {
                        return;
                    }
                    
                    vscode.postMessage({
                        type: 'sendNotes',
                        notes: notes,
                        workItemId: workItemId
                    });
                }
                
                // Listen for messages from the extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    
                    switch (message.type) {
                        case 'updateTemplate':
                            document.getElementById('meetingNotes').value = message.template;
                            updateSendButton();
                            break;
                        case 'clearForm':
                            document.getElementById('meetingType').value = '';
                            document.getElementById('meetingNotes').value = '';
                            document.getElementById('workItemId').value = '';
                            // Uncheck all participants
                            const checkboxes = document.querySelectorAll('.participant-checkbox input[type="checkbox"]');
                            checkboxes.forEach(checkbox => checkbox.checked = false);
                            updateSendButton();
                            break;
                    }
                });
            </script>
        </body>
        </html>`;
    }
}