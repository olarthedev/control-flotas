import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsDateString, IsString, MaxLength, IsEnum, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { CreateExpenseDto } from './create-expense.dto';
import { ExpenseStatus } from '../expense.entity';

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {
    @IsOptional()
    @IsEnum(ExpenseStatus, { message: 'status debe ser: pending, approved o rejected' })
    status?: ExpenseStatus;

    @IsOptional()
    @IsString({ message: 'rejectionReason debe ser texto' })
    @MaxLength(500, { message: 'rejectionReason no puede exceder 500 caracteres' })
    rejectionReason?: string;

    @IsOptional()
    @IsDateString({}, { message: 'validatedAt debe ser una fecha válida' })
    validatedAt?: string;

    @IsOptional()
    @IsNumber({}, { message: 'validatedById debe ser un número' })
    @Transform(({ value }) => value !== undefined && value !== null ? parseInt(value, 10) : undefined)
    validatedById?: number;
}
