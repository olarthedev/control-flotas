export class CreateEvidenceDto {
    fileName: string;
    filePath: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    expenseId: number;
    description?: string;
    notes?: string;
}
