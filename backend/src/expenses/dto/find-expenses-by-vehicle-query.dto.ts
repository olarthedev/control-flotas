import { Transform } from 'class-transformer';
import { IsArray, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ExpenseStatus } from '../expense.entity';

export class FindExpensesByVehicleQueryDto {
    @IsOptional()
    @IsDateString({}, { message: 'dateFrom debe ser una fecha válida' })
    dateFrom?: string;

    @IsOptional()
    @IsDateString({}, { message: 'dateTo debe ser una fecha válida' })
    dateTo?: string;

    @IsOptional()
    @Transform(({ value }) => {
        if (!value) {
            return undefined;
        }

        if (Array.isArray(value)) {
            return value;
        }

        return String(value)
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean);
    })
    @IsArray({ message: 'statuses debe ser una lista de estados' })
    @IsEnum(ExpenseStatus, { each: true, message: 'statuses contiene un estado inválido' })
    statuses?: ExpenseStatus[];
}
