import { JsonPatchDocument, Operation } from "azure-devops-node-api/interfaces/common/VSSInterfaces";
import { Mapper } from "../../../../mapper";
import { PreDefinedTask } from "./pre-defined-task";

export class PreDefinedTaskJsonPatchDocumentMapper
    implements Mapper<PreDefinedTask, JsonPatchDocument> {

    private static readonly TitleFieldPath: string = '/fields/System.Title';
    private static readonly DescriptionFieldPath: string = '/fields/System.Description';
    private static readonly RemainingWorkFieldPath: string = '/fields/Microsoft.VSTS.Scheduling.RemainingWork';
    private static readonly AreaPathFieldPath: string = '/fields/System.AreaPath';
    private static readonly IterationPathFieldPath: string = '/fields/System.IterationPath';
    private static readonly RelationsFieldPath: string = '/relations/-';
    private static readonly AssignedToFieldPath: string = '/fields/System.AssignedTo';

    constructor(
        private readonly userDisplayName: string,
        private readonly organizationUri: string,
        private readonly workItemNumber: number,
        private readonly areaPath: string,
        private readonly iterationPath: string
    ) {}

    /** @inheritdoc */
    map(input: PreDefinedTask): JsonPatchDocument {
        return [
            {
                op: Operation.Add,
                path: PreDefinedTaskJsonPatchDocumentMapper.TitleFieldPath,
                value: input.name,
            },
            {
                op: Operation.Add,
                path: PreDefinedTaskJsonPatchDocumentMapper.RemainingWorkFieldPath,
                value: input.remainingWork,
            },
            {
                op: Operation.Add,
                path: PreDefinedTaskJsonPatchDocumentMapper.DescriptionFieldPath,
                value: input.description,
            },
            {
                op: Operation.Add,
                path: PreDefinedTaskJsonPatchDocumentMapper.AreaPathFieldPath,
                value: this.areaPath,
            },
            {
                op: Operation.Add,
                path: PreDefinedTaskJsonPatchDocumentMapper.IterationPathFieldPath,
                value: this.iterationPath,
            },
            {
                op: Operation.Add,
                path: PreDefinedTaskJsonPatchDocumentMapper.AssignedToFieldPath,
                value: this.userDisplayName
            },
            {
                op: Operation.Add,
                path: PreDefinedTaskJsonPatchDocumentMapper.RelationsFieldPath,
                value: {
                    rel: 'System.LinkTypes.Hierarchy-Reverse',
                    url: `${this.organizationUri}/_apis/wit/workItems/${this.workItemNumber}`,
                    attributes: {
                        comment: 'Task created by Hazel\'s Toolbox',
                    },
                },
            }
        ];
    }

}