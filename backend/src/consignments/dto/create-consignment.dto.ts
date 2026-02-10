import { IsString, IsNumber, IsNotEmpty, MinLength, MaxLength, IsOptional, IsDateString, IsPositive } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateConsignmentDto {
    @IsString({ message: 'consignmentNumber debe ser texto' })
    @IsNotEmpty({ message: 'consignmentNumber es requerido' })
    @MinLength(3, { message: 'consignmentNumber debe tener al menos 3 caracteres' })
    @MaxLength(50, { message: 'consignmentNumber no puede exceder 50 caracteres' })
    consignmentNumber: string;

    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'amount debe ser un número válido' })
    @IsPositive({ message: 'amount debe ser mayor que cero' })
    @IsNotEmpty({ message: 'amount es requerido' })
    @Transform(({ value }) => parseFloat(value))
    amount: number;

    @IsDateString({}, { message: 'consignmentDate debe ser una fecha válida' })
    @IsNotEmpty({ message: 'consignmentDate es requerido' })
    consignmentDate: Date;

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

    @IsOptional()
    @IsString({ message: 'consignmentNotes debe ser texto' })
    @MaxLength(1000, { message: 'consignmentNotes no puede exceder 1000 caracteres' })
    consignmentNotes?: string;
}
