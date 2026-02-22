import { IsString, IsNumber, IsNotEmpty, MinLength, MaxLength, IsOptional, IsDateString, IsPositive } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateTripDto {
    @IsString({ message: 'tripNumber debe ser texto' })
    @IsNotEmpty({ message: 'tripNumber es requerido' })
    @MinLength(3, { message: 'tripNumber debe tener al menos 3 caracteres' })
    @MaxLength(50, { message: 'tripNumber no puede exceder 50 caracteres' })
    tripNumber: string;

    @IsDateString({}, { message: 'startDate debe ser una fecha válida' })
    @IsNotEmpty({ message: 'startDate es requerido' })
    startDate: string; // use string so IsDateString validates before transformation

    @IsOptional()
    @IsString({ message: 'origin debe ser texto' })
    @MaxLength(200, { message: 'origin no puede exceder 200 caracteres' })
    origin?: string;

    @IsOptional()
    @IsString({ message: 'destination debe ser texto' })
    @MaxLength(200, { message: 'destination no puede exceder 200 caracteres' })
    destination?: string;

    @IsOptional()
    @IsString({ message: 'description debe ser texto' })
    @MaxLength(1000, { message: 'description no puede exceder 1000 caracteres' })
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
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'plannedBudget debe ser un número' })
    @IsPositive({ message: 'plannedBudget debe ser mayor que cero' })
    @Transform(({ value }) => value !== undefined && value !== null ? parseFloat(value) : undefined)
    plannedBudget?: number;
}
