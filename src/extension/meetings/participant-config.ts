import * as vscode from 'vscode';

/**
 * Interface for participant configuration
 */
export interface ParticipantConfig {
    name: string;
    selected: boolean;
}

/**
 * Get the list of configured participants from VS Code settings
 */
export function getConfiguredParticipants(): string[] {
    const config = vscode.workspace.getConfiguration('tacosontitan.toolbox.meetings');
    return config.get<string[]>('participants', [
        'Product Owner',
        'Scrum Master', 
        'Tech Lead',
        'Developer',
        'QA Engineer',
        'Business Analyst',
        'Stakeholder',
        'Designer',
        'Architect'
    ]);
}

/**
 * Generate participants section for meeting notes
 */
export function generateParticipantsSection(selectedParticipants: string[]): string {
    if (selectedParticipants.length === 0) {
        return '## Attendees:\n- \n';
    }
    
    return '## Attendees:\n' + 
        selectedParticipants.map(participant => `- ${participant}: `).join('\n') + '\n';
}