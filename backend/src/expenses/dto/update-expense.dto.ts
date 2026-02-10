import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsDateString, IsString, MaxLength, IsEnum } from 'class-validator';
import { CreateExpenseDto } from './create-expense.dto';
import { ExpenseStatus } from '../expense.entity';

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {
    @IsOptional()
    @IsEnum(ExpenseStatus, { message: 'status debe ser un estado válido' })
    status?: ExpenseStatus;

    @IsOptional()
    @IsString({ message: 'rejectionReason debe ser texto' })
    @MaxLength(500, { message: 'rejectionReason no puede exceder 500 caracteres' })
    rejectionReason?: string;

    @IsOptional()
    @IsDateString({}, { message: 'validatedAt debe ser una fecha válida' })
    validatedAt?: Date;

    @IsOptional()
    @IsString({ message: 'validatedBy debe ser texto' })
    @MaxLength(255, { message: 'validatedBy no puede exceder 255 caracteres' })
    validatedBy?: string;
}
