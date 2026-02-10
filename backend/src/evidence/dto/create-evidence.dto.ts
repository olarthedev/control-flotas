import { IsString, IsNumber, IsNotEmpty, MaxLength, IsOptional, IsDateString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateEvidenceDto {
    @IsString({ message: 'fileName debe ser texto' })
    @IsNotEmpty({ message: 'fileName es requerido' })
    @MaxLength(255, { message: 'fileName no puede exceder 255 caracteres' })
    fileName: string;

    @IsString({ message: 'filePath debe ser texto' })
    @IsNotEmpty({ message: 'filePath es requerido' })
    @MaxLength(500, { message: 'filePath no puede exceder 500 caracteres' })
    filePath: string;

    @IsString({ message: 'fileUrl debe ser texto' })
    @IsNotEmpty({ message: 'fileUrl es requerido' })
    @MaxLength(500, { message: 'fileUrl no puede exceder 500 caracteres' })
    fileUrl: string;

    @IsString({ message: 'fileType debe ser texto' })
    @IsNotEmpty({ message: 'fileType es requerido' })
    @MaxLength(50, { message: 'fileType no puede exceder 50 caracteres' })
    fileType: string;

    @IsNumber({}, { message: 'fileSize debe ser un número' })
    @IsNotEmpty({ message: 'fileSize es requerido' })
    @Min(0, { message: 'fileSize debe ser mayor o igual a cero' })
    @Transform(({ value }) => parseInt(value, 10))
    fileSize: number;

    @IsNumber({}, { message: 'expenseId debe ser un número' })
    @IsNotEmpty({ message: 'expenseId es requerido' })
    @Transform(({ value }) => parseInt(value, 10))
    expenseId: number;

    @IsOptional()
    @IsString({ message: 'description debe ser texto' })
    @MaxLength(500, { message: 'description no puede exceder 500 caracteres' })
    description?: string;

    @IsOptional()
    @IsString({ message: 'notes debe ser texto' })
    @MaxLength(1000, { message: 'notes no puede exceder 1000 caracteres' })
    notes?: string;
}
