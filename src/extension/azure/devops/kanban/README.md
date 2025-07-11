# Azure DevOps Kanban Board

A minimal kanban board implementation for Visual Studio Code that integrates with Azure DevOps to manage work item tasks with a focus on single piece flow.

## Features

- **Minimal Interface**: Clean, focused UI with three columns (To Do, In Progress, Done)
- **Drag & Drop**: Move tasks between states using drag and drop
- **Azure DevOps Integration**: Real-time synchronization with Azure DevOps work items
- **Auto-refresh**: Configurable automatic refresh to keep the board up-to-date
- **Work Item Filtering**: Load tasks for specific parent work items

## Usage

1. **Open the Kanban Board**: 
   - Use the command palette (`Ctrl+Shift+P`) and search for "Hazel's Toolbox: Open Kanban Board"
   - Or find the "Kanban Board" panel in the Explorer sidebar

2. **Load Work Items**:
   - Enter a work item ID in the input field
   - Click "Load Work Item" to fetch all child tasks from Azure DevOps

3. **Manage Task States**:
   - Drag tasks between columns to change their state
   - States map to Azure DevOps work item states (New, Active, Closed)

## Configuration

Add these settings to your VS Code `settings.json`:

```json
{
  "tacosontitan.toolbox.azure.devops.organization": "your-org-name",
  "tacosontitan.toolbox.azure.devops.project": "your-project-name",
  "tacosontitan.toolbox.azure.devops.userDisplayName": "Your Display Name",
  "tacosontitan.toolbox.kanban.refreshInterval": 30,
  "tacosontitan.toolbox.kanban.showCompletedTasks": true
}
```

### Configuration Options

- `refreshInterval`: How often (in seconds) the board should auto-refresh (default: 30)
- `showCompletedTasks`: Whether to show completed tasks in the Done column (default: true)

## Azure DevOps Setup

1. **Personal Access Token**: You'll be prompted to enter your Azure DevOps Personal Access Token on first use
2. **Permissions**: Ensure your PAT has "Work Items (Read & Write)" permissions
3. **Organization**: Configure your Azure DevOps organization name in settings

## State Mapping

The kanban board uses a simplified three-column layout that maps to Azure DevOps states:

- **To Do** → `New` state in Azure DevOps
- **In Progress** → `Active` state in Azure DevOps  
- **Done** → `Closed` state in Azure DevOps

## Single Piece Flow

This kanban board is designed with single piece flow in mind:

- Focus on one task at a time in the "In Progress" column
- Minimize work in progress (WIP)
- Quick visual feedback on task status
- Drag and drop for effortless state transitions

## Troubleshooting

### Common Issues

1. **No tasks loading**: Verify your Azure DevOps configuration and PAT permissions
2. **Drag and drop not working**: Ensure you have write permissions to the work items
3. **Auto-refresh not working**: Check the `refreshInterval` setting in your configuration

### Error Messages

- "Work item not found": The specified work item ID doesn't exist or you don't have access
- "Failed to update task state": Check your Azure DevOps permissions and network connection