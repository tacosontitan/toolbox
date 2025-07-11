/**
 * Templates for different meeting types in the meeting view.
 */
export interface MeetingTemplate {
    name: string;
    template: string;
}

export const MeetingTemplates: Record<string, MeetingTemplate> = {
    "product owner": {
        name: "Product Owner Meeting",
        template: `# Product Owner Meeting Notes

## Date: ${new Date().toLocaleDateString()}

## Attendees:
- Product Owner: 
- Team Members: 

## Agenda:
1. Requirements Review
2. Priority Discussion
3. Acceptance Criteria Clarification
4. Timeline & Milestones

## Discussion Points:
- 

## Key Decisions:
- 

## Action Items:
- [ ] 
- [ ] 

## Next Steps:
- 

## Questions/Concerns:
- 
`
    },
    "quality assurance": {
        name: "Quality Assurance Meeting",
        template: `# Quality Assurance Meeting Notes

## Date: ${new Date().toLocaleDateString()}

## Attendees:
- QA Lead: 
- Developers: 
- Other: 

## Agenda:
1. Test Strategy Review
2. Test Cases Discussion
3. Quality Standards
4. Risk Assessment

## Testing Scope:
- Functional Testing: 
- Non-functional Testing: 
- Integration Testing: 
- Security Testing: 

## Test Cases Reviewed:
- 

## Quality Concerns:
- 

## Action Items:
- [ ] 
- [ ] 

## Test Timeline:
- 

## Notes:
- 
`
    },
    "stakeholders": {
        name: "Stakeholders Meeting",
        template: `# Stakeholders Meeting Notes

## Date: ${new Date().toLocaleDateString()}

## Attendees:
- Stakeholders: 
- Project Team: 

## Agenda:
1. Project Status Update
2. Requirements Gathering
3. Feedback Collection
4. Expectations Alignment

## Current Status:
- Progress: 
- Completed: 
- In Progress: 
- Upcoming: 

## Stakeholder Feedback:
- 

## Requirements Changes:
- 

## Expectations & Concerns:
- 

## Action Items:
- [ ] 
- [ ] 

## Next Meeting:
- Date: 
- Topics: 

## Notes:
- 
`
    },
    "peer review": {
        name: "Peer Review Meeting",
        template: `# Peer Review Meeting Notes

## Date: ${new Date().toLocaleDateString()}

## Attendees:
- Reviewers: 
- Author: 

## Review Focus:
- Code Quality
- Architecture & Design
- Best Practices
- Performance Considerations

## Items Reviewed:
- 

## Feedback Summary:
### Positive Points:
- 

### Areas for Improvement:
- 

### Critical Issues:
- 

## Recommendations:
- 

## Action Items:
- [ ] 
- [ ] 

## Follow-up:
- Next review date: 
- Items to address: 

## Notes:
- 
`
    }
};

export function getMeetingTemplate(meetingType: string): string {
    const template = MeetingTemplates[meetingType.toLowerCase()];
    return template ? template.template : MeetingTemplates["stakeholders"].template;
}

export function getMeetingTypes(): string[] {
    return Object.keys(MeetingTemplates);
}