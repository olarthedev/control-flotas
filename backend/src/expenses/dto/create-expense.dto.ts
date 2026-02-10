import { IsEnum, IsNumber, IsDateString, IsOptional, IsString, IsPositive, MaxLength, Min, IsNotEmpty } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ExpenseType, ExpenseStatus } from '../expense.entity';

export class CreateExpenseDto {
    @IsEnum(ExpenseType, { message: 'type debe ser un tipo de gasto válido' })
    @IsNotEmpty({ message: 'type es requerido' })
    type: ExpenseType;

    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amount debe ser un número válido' })
    @IsPositive({ message: 'amount debe ser mayor que cero' })
    @IsNotEmpty({ message: 'amount es requerido' })
    @Transform(({ value }) => parseFloat(value))
    amount: number;

    @IsDateString({}, { message: 'expenseDate debe ser una fecha válida en formato ISO' })
    @IsNotEmpty({ message: 'expenseDate es requerido' })
    expenseDate: Date;

    @IsOptional()
    @IsString({ message: 'description debe ser texto' })
    @MaxLength(500, { message: 'description no puede exceder 500 caracteres' })
    description?: string;

    @IsOptional()
    @IsString({ message: 'notes debe ser texto' })
    @MaxLength(1000, { message: 'notes no puede exceder 1000 caracteres' })
    notes?: string;

    @IsNumber({}, { message: 'driverId debe ser un número' })
    @IsNotEmpty({ message: 'driverId es requerido' })
    @Transform(({ value }) => parseInt(value, 10))
    driverId: number;

    @IsOptional()
    @IsNumber({}, { message: 'vehicleId debe ser un número' })
    @Transform(({ value }) => value !== undefined && value !== null ? parseInt(value, 10) : undefined)
    vehicleId?: number;

    @IsOptional()
    @IsNumber({}, { message: 'tripId debe ser un número' })
    @Transform(({ value }) => value !== undefined && value !== null ? parseInt(value, 10) : undefined)
    tripId?: number;
}
