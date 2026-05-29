import { IsEnum, IsNumber, IsDateString, IsOptional, IsString, IsPositive, MaxLength, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';
import { ExpenseType } from '../expense.entity';


export class CreateExpenseDto {
    @IsEnum(ExpenseType, { message: 'type debe ser: fuel, toll, maintenance, food, lodging, parking u other' })
    @IsNotEmpty({ message: 'type es requerido' })
    type: ExpenseType;

    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amount debe ser un número válido' })
    @IsPositive({ message: 'amount debe ser mayor que cero' })
    @IsNotEmpty({ message: 'amount es requerido' })
    @Transform(({ value }) => parseFloat(value))
    amount: number;

    @IsDateString({}, { message: 'expenseDate debe ser una fecha válida en formato ISO' })
    @IsNotEmpty({ message: 'expenseDate es requerido' })
    expenseDate: string;

    @IsOptional()
    @IsString({ message: 'description debe ser texto' })
    @MaxLength(500, { message: 'description no puede exceder 500 caracteres' })
    description?: string;

    @IsNumber({}, { message: 'driverId debe ser un número' })
    @IsNotEmpty({ message: 'driverId es requerido' })
    @Transform(({ value }) => parseInt(value, 10))
    driverId: number;

    @IsNumber({}, { message: 'vehicleId debe ser un número' })
    @IsNotEmpty({ message: 'vehicleId es requerido' })
    @Transform(({ value }) => parseInt(value, 10))
    vehicleId: number;

    @IsOptional()
    @IsNumber({}, { message: 'tripId debe ser un número' })
    @Transform(({ value }) => value !== undefined && value !== null ? parseInt(value, 10) : undefined)
    tripId?: number;

    @IsOptional()
    @IsNumber({}, { message: 'consignmentId debe ser un número' })
    @Transform(({ value }) => value !== undefined && value !== null ? parseInt(value, 10) : undefined)
    consignmentId?: number;
}
