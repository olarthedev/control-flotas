import { IsString, IsNumber, IsNotEmpty, MinLength, MaxLength, IsOptional, IsDateString, IsPositive, Min, IsEnum } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { MaintenanceType } from '../maintenance-record.entity';

export class CreateMaintenanceDto {
    @IsEnum(MaintenanceType, { message: 'type debe ser un tipo de mantenimiento válido' })
    @IsNotEmpty({ message: 'type es requerido' })
    type: MaintenanceType;

    @IsString({ message: 'title debe ser texto' })
    @IsNotEmpty({ message: 'title es requerido' })
    @MinLength(3, { message: 'title debe tener al menos 3 caracteres' })
    @MaxLength(100, { message: 'title no puede exceder 100 caracteres' })
    title: string;

    @IsString({ message: 'description debe ser texto' })
    @IsNotEmpty({ message: 'description es requerido' })
    @MinLength(10, { message: 'description debe tener al menos 10 caracteres' })
    @MaxLength(1000, { message: 'description no puede exceder 1000 caracteres' })
    description: string;

    @IsDateString({}, { message: 'maintenanceDate debe ser una fecha válida' })
    @IsNotEmpty({ message: 'maintenanceDate es requerido' })
    maintenanceDate: Date;

    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'cost debe ser un número válido' })
    @IsPositive({ message: 'cost debe ser mayor que cero' })
    @IsNotEmpty({ message: 'cost es requerido' })
    @Transform(({ value }) => parseFloat(value))
    cost: number;

    @IsNumber({}, { message: 'vehicleId debe ser un número' })
    @IsNotEmpty({ message: 'vehicleId es requerido' })
    @Transform(({ value }) => parseInt(value, 10))
    vehicleId: number;

    @IsOptional()
    @IsString({ message: 'invoiceNumber debe ser texto' })
    @MaxLength(50, { message: 'invoiceNumber no puede exceder 50 caracteres' })
    invoiceNumber?: string;

    @IsOptional()
    @IsString({ message: 'provider debe ser texto' })
    @MaxLength(100, { message: 'provider no puede exceder 100 caracteres' })
    provider?: string;

    @IsOptional()
    @IsNumber({}, { message: 'mileageAtMaintenance debe ser un número' })
    @Min(0, { message: 'mileageAtMaintenance debe ser mayor o igual a cero' })
    @Transform(({ value }) => value !== undefined && value !== null ? parseInt(value, 10) : undefined)
    mileageAtMaintenance?: number;

    @IsOptional()
    @IsNumber({}, { message: 'nextMaintenanceMileage debe ser un número' })
    @Min(0, { message: 'nextMaintenanceMileage debe ser mayor o igual a cero' })
    @Transform(({ value }) => value !== undefined && value !== null ? parseInt(value, 10) : undefined)
    nextMaintenanceMileage?: number;

    @IsOptional()
    @IsDateString({}, { message: 'nextMaintenanceDate debe ser una fecha válida' })
    nextMaintenanceDate?: Date;

    @IsOptional()
    @IsString({ message: 'technicalNotes debe ser texto' })
    @MaxLength(1000, { message: 'technicalNotes no puede exceder 1000 caracteres' })
    technicalNotes?: string;
}
