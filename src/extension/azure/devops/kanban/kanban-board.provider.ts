import * as vscode from 'vscode';
import { IWorkItemService } from '../../../core/workflow';
import { WorkItem } from '../../../core/workflow/work-item';
import { WorkItemState } from '../../../core/workflow/work-item-state';

/**
 * Provider for the Kanban Board WebView
 */
export class KanbanBoardProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'tacosontitan.toolbox.kanbanBoard';

    private _view?: vscode.WebviewView;
    private _workItemId?: number;
    private _tasks: WorkItem[] = [];
    private _refreshInterval?: NodeJS.Timeout;

    constructor(
        private readonly _extensionUri: vscode.Uri,
        private readonly _workItemService: IWorkItemService
    ) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            // Allow scripts in the webview
            enableScripts: true,
            localResourceRoots: [
                this._extensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(async data => {
            switch (data.type) {
                case 'loadWorkItem':
                    await this.loadWorkItem(data.workItemId);
                    break;
                case 'updateTaskState':
                    await this.updateTaskState(data.taskId, data.newState);
                    break;
                case 'refreshBoard':
                    if (this._workItemId) {
                        await this.loadWorkItem(this._workItemId);
                    }
                    break;
            }
        });

        // Set up auto-refresh based on configuration
        this.setupAutoRefresh();

        webviewView.onDidDispose(() => {
            if (this._refreshInterval) {
                clearInterval(this._refreshInterval);
            }
        });
    }

    private setupAutoRefresh() {
        const config = vscode.workspace.getConfiguration('tacosontitan.toolbox.kanban');
        const refreshInterval = config.get<number>('refreshInterval', 30);
        
        if (refreshInterval > 0) {
            this._refreshInterval = setInterval(async () => {
                if (this._workItemId && this._view) {
                    await this.loadWorkItem(this._workItemId);
                }
            }, refreshInterval * 1000);
        }
    }

    public async loadWorkItem(workItemId: number) {
        this._workItemId = workItemId;
        
        try {
            // Load the parent work item and its child tasks
            const parentWorkItem = await this._workItemService.getWorkItem(workItemId);
            if (!parentWorkItem) {
                this._view?.webview.postMessage({
                    type: 'error',
                    message: `Work item #${workItemId} not found. Please check that the work item ID exists and you have access to it.`
                });
                return;
            }

            // Get child work items
            this._tasks = await this.getChildTasks(workItemId);

            this._view?.webview.postMessage({
                type: 'workItemLoaded',
                parentWorkItem: parentWorkItem,
                tasks: this._tasks,
                hasNoTasks: this._tasks.length === 0
            });
        } catch (error) {
            this._view?.webview.postMessage({
                type: 'error',
                message: `Failed to load work item #${workItemId}: ${(error as Error).message}`
            });
        }
    }

    private async getChildTasks(parentWorkItemId: number): Promise<WorkItem[]> {
        // Use the actual work item service to get child work items
        try {
            return await this._workItemService.getChildWorkItems(parentWorkItemId);
        } catch (error) {
            console.error('Failed to load child work items:', error);
            // Return empty array on error
            return [];
        }
    }

    private async updateTaskState(taskId: number, newState: string) {
        const task = this._tasks.find(t => t.id === taskId);
        if (!task) {
            return;
        }

        try {
            // Update the task state in Azure DevOps
            await this._workItemService.changeWorkItemState(task, new WorkItemState(newState));
            
            // Update local state
            task.state = new WorkItemState(newState);
            
            this._view?.webview.postMessage({
                type: 'taskStateUpdated',
                taskId: taskId,
                newState: newState
            });
            
            // Reload the tasks to reflect the change
            if (this._workItemId) {
                await this.loadWorkItem(this._workItemId);
            }
        } catch (error) {
            this._view?.webview.postMessage({
                type: 'error',
                message: `Failed to update task state: ${(error as Error).message}`
            });
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Kanban Board</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                    margin: 0;
                    padding: 16px;
                }
                
                .header {
                    margin-bottom: 16px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                }
                
                .work-item-input {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 16px;
                }
                
                .work-item-input input {
                    flex: 1;
                    padding: 6px 8px;
                    background: var(--vscode-input-background);
                    border: 1px solid var(--vscode-input-border);
                    color: var(--vscode-input-foreground);
                }
                
                .work-item-input button {
                    padding: 6px 12px;
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    cursor: pointer;
                }
                
                .work-item-input button:hover {
                    background: var(--vscode-button-hoverBackground);
                }
                
                .kanban-board {
                    display: flex;
                    gap: 16px;
                    min-height: 400px;
                }
                
                .column {
                    flex: 1;
                    background: var(--vscode-sideBar-background);
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 4px;
                    min-height: 300px;
                }
                
                .column-header {
                    padding: 12px;
                    background: var(--vscode-tab-activeBackground);
                    border-bottom: 1px solid var(--vscode-panel-border);
                    font-weight: bold;
                    text-align: center;
                }
                
                .column-content {
                    padding: 8px;
                    min-height: 250px;
                }
                
                .task-card {
                    background: var(--vscode-editor-background);
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 4px;
                    padding: 8px;
                    margin-bottom: 8px;
                    cursor: move;
                    transition: background-color 0.2s;
                }
                
                .task-card:hover {
                    background: var(--vscode-list-hoverBackground);
                }
                
                .task-card.dragging {
                    opacity: 0.5;
                }
                
                .task-title {
                    font-weight: bold;
                    margin-bottom: 4px;
                }
                
                .task-meta {
                    font-size: 0.9em;
                    color: var(--vscode-descriptionForeground);
                }
                
                .error {
                    color: var(--vscode-errorForeground);
                    background: var(--vscode-inputValidation-errorBackground);
                    padding: 8px;
                    border-radius: 4px;
                    margin-bottom: 16px;
                }
                
                .empty-state {
                    text-align: center;
                    color: var(--vscode-descriptionForeground);
                    padding: 32px;
                }
                
                .no-tasks-message {
                    background: var(--vscode-editor-inactiveSelectionBackground);
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 4px;
                    padding: 16px;
                    color: var(--vscode-foreground);
                    font-size: 0.9em;
                    line-height: 1.4;
                }
                
                .no-tasks-message p {
                    margin: 8px 0;
                }
                
                .no-tasks-message ul, .no-tasks-message ol {
                    margin: 8px 0;
                    padding-left: 20px;
                }
                
                .no-tasks-message li {
                    margin: 4px 0;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>Azure DevOps Kanban Board</h2>
                <div class="work-item-input">
                    <input type="number" id="workItemId" placeholder="Enter work item ID..." />
                    <button onclick="loadWorkItem()">Load Work Item</button>
                    <button onclick="refreshBoard()">Refresh</button>
                </div>
            </div>
            
            <div id="error" class="error" style="display: none;"></div>
            
            <div id="kanbanBoard" class="kanban-board" style="display: none;">
                <div class="column">
                    <div class="column-header">To Do</div>
                    <div class="column-content" id="todoColumn" ondrop="drop(event, 'New')" ondragover="allowDrop(event)"></div>
                </div>
                <div class="column">
                    <div class="column-header">In Progress</div>
                    <div class="column-content" id="activeColumn" ondrop="drop(event, 'Active')" ondragover="allowDrop(event)"></div>
                </div>
                <div class="column">
                    <div class="column-header">Done</div>
                    <div class="column-content" id="closedColumn" ondrop="drop(event, 'Closed')" ondragover="allowDrop(event)"></div>
                </div>
            </div>
            
            <div id="emptyState" class="empty-state">
                <p>Enter a work item ID above to load the kanban board.</p>
            </div>

            <script>
                const vscode = acquireVsCodeApi();

                function refreshBoard() {
                    vscode.postMessage({
                        type: 'refreshBoard'
                    });
                }

                function loadWorkItem() {
                    const workItemId = document.getElementById('workItemId').value;
                    if (!workItemId) {
                        showError('Please enter a work item ID');
                        return;
                    }
                    
                    vscode.postMessage({
                        type: 'loadWorkItem',
                        workItemId: parseInt(workItemId)
                    });
                }

                function showError(message) {
                    const errorDiv = document.getElementById('error');
                    errorDiv.textContent = message;
                    errorDiv.style.display = 'block';
                    setTimeout(() => {
                        errorDiv.style.display = 'none';
                    }, 5000);
                }

                function renderTasks(tasks, hasNoTasks) {
                    // Clear existing tasks
                    document.getElementById('todoColumn').innerHTML = '';
                    document.getElementById('activeColumn').innerHTML = '';
                    document.getElementById('closedColumn').innerHTML = '';

                    if (hasNoTasks) {
                        // Show a helpful message when no tasks are found
                        const noTasksMessage = document.createElement('div');
                        noTasksMessage.className = 'no-tasks-message';
                        noTasksMessage.innerHTML = \`
                            <p><strong>No child tasks found for this work item.</strong></p>
                            <p>This could mean:</p>
                            <ul>
                                <li>The work item doesn't have any child tasks linked to it</li>
                                <li>The child tasks are in a different Azure DevOps project</li>
                                <li>The tasks are not linked using the parent-child relationship</li>
                            </ul>
                            <p>To add child tasks:</p>
                            <ol>
                                <li>Go to Azure DevOps and open work item #\${window.workItemId || 'N/A'}</li>
                                <li>Create new tasks and link them as children to this work item</li>
                                <li>Refresh this board to see the tasks</li>
                            </ol>
                        \`;
                        document.getElementById('todoColumn').appendChild(noTasksMessage);
                        return;
                    }

                    tasks.forEach(task => {
                        const taskElement = createTaskElement(task);
                        
                        if (task.state.name === 'New') {
                            document.getElementById('todoColumn').appendChild(taskElement);
                        } else if (task.state.name === 'Active') {
                            document.getElementById('activeColumn').appendChild(taskElement);
                        } else if (task.state.name === 'Closed') {
                            document.getElementById('closedColumn').appendChild(taskElement);
                        }
                    });
                }

                function createTaskElement(task) {
                    const taskDiv = document.createElement('div');
                    taskDiv.className = 'task-card';
                    taskDiv.draggable = true;
                    taskDiv.dataset.taskId = task.id;
                    
                    taskDiv.innerHTML = \`
                        <div class="task-title">\${task.title}</div>
                        <div class="task-meta">
                            <div>ID: \${task.id}</div>
                            <div>Activity: \${task.activity}</div>
                            <div>Remaining: \${task.remainingWork}h</div>
                        </div>
                    \`;
                    
                    taskDiv.addEventListener('dragstart', (e) => {
                        e.dataTransfer.setData('text/plain', task.id);
                        taskDiv.classList.add('dragging');
                    });
                    
                    taskDiv.addEventListener('dragend', () => {
                        taskDiv.classList.remove('dragging');
                    });
                    
                    return taskDiv;
                }

                function allowDrop(ev) {
                    ev.preventDefault();
                }

                function drop(ev, newState) {
                    ev.preventDefault();
                    const taskId = ev.dataTransfer.getData('text/plain');
                    
                    vscode.postMessage({
                        type: 'updateTaskState',
                        taskId: parseInt(taskId),
                        newState: newState
                    });
                }

                // Handle messages from the extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    
                    switch (message.type) {
                        case 'workItemLoaded':
                            document.getElementById('kanbanBoard').style.display = 'flex';
                            document.getElementById('emptyState').style.display = 'none';
                            // Store workItemId globally for use in renderTasks
                            window.workItemId = message.parentWorkItem.id;
                            renderTasks(message.tasks, message.hasNoTasks);
                            break;
                        case 'error':
                            showError(message.message);
                            break;
                        case 'taskStateUpdated':
                            // Refresh the board after state update
                            loadWorkItem();
                            break;
                    }
                });

                // Allow Enter key to load work item
                document.getElementById('workItemId').addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        loadWorkItem();
                    }
                });
            </script>
        </body>
        </html>`;
    }
}