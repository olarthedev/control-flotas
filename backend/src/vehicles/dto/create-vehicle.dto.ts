import { IsString, IsNumber, IsNotEmpty, MinLength, MaxLength, IsOptional, IsDateString, IsPositive, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateVehicleDto {
    @IsString({ message: 'licensePlate debe ser texto' })
    @IsNotEmpty({ message: 'licensePlate es requerido' })
    @MinLength(3, { message: 'licensePlate debe tener al menos 3 caracteres' })
    @MaxLength(20, { message: 'licensePlate no puede exceder 20 caracteres' })
    licensePlate: string;

    @IsString({ message: 'brand debe ser texto' })
    @IsNotEmpty({ message: 'brand es requerido' })
    @MaxLength(50, { message: 'brand no puede exceder 50 caracteres' })
    brand: string;

    @IsString({ message: 'model debe ser texto' })
    @IsNotEmpty({ message: 'model es requerido' })
    @MaxLength(50, { message: 'model no puede exceder 50 caracteres' })
    model: string;

    @IsNumber({}, { message: 'year debe ser un número' })
    @IsNotEmpty({ message: 'year es requerido' })
    @Min(1900, { message: 'year debe ser mayor que 1900' })
    @Max(2100, { message: 'year debe ser menor que 2100' })
    @Transform(({ value }) => parseInt(value, 10))
    year: number;

    @IsOptional()
    @IsString({ message: 'vin debe ser texto' })
    @MaxLength(20, { message: 'vin no puede exceder 20 caracteres' })
    vin?: string;

    @IsString({ message: 'type debe ser texto' })
    @IsNotEmpty({ message: 'type es requerido' })
    type: string;

    @IsOptional()
    @IsNumber({}, { message: 'driverId debe ser un número' })
    @Transform(({ value }) => value !== undefined && value !== null ? parseInt(value, 10) : undefined)
    driverId?: number;

    @IsOptional()
    @IsDateString({}, { message: 'soatExpiryDate debe ser una fecha válida' })
    soatExpiryDate?: Date;

    @IsOptional()
    @IsDateString({}, { message: 'technicalReviewExpiryDate debe ser una fecha válida' })
    technicalReviewExpiryDate?: Date;

    @IsOptional()
    @IsDateString({}, { message: 'insuranceExpiryDate debe ser una fecha válida' })
    insuranceExpiryDate?: Date;

    @IsOptional()
    @IsDateString({}, { message: 'licenseExpiryDate debe ser una fecha válida' })
    licenseExpiryDate?: Date;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'maintenanceBudget debe ser un número' })
    @IsPositive({ message: 'maintenanceBudget debe ser mayor que cero' })
    @Transform(({ value }) => value !== undefined && value !== null ? parseFloat(value) : undefined)
    maintenanceBudget?: number;

    @IsOptional()
    @IsNumber({}, { message: 'currentMileage debe ser un número' })
    @Min(0, { message: 'currentMileage debe ser mayor o igual a cero' })
    @Transform(({ value }) => value !== undefined && value !== null ? parseInt(value, 10) : undefined)
    currentMileage?: number;
}
