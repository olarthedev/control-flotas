import { IsString, IsNumber, IsNotEmpty, MinLength, MaxLength, IsOptional, IsDateString, IsPositive, Min, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { MaintenanceType } from '../maintenance-record.entity';

export class CreateMaintenanceDto {
    @IsEnum(MaintenanceType, { message: 'type debe ser: preventive, corrective o emergency' })
    @IsNotEmpty({ message: 'type es requerido' })
    type: MaintenanceType;

    @IsString({ message: 'title debe ser texto' })
    @IsNotEmpty({ message: 'title es requerido' })
    @MinLength(3, { message: 'title debe tener al menos 3 caracteres' })
    @MaxLength(200, { message: 'title no puede exceder 200 caracteres' })
    title: string;

    @IsDateString({}, { message: 'maintenanceDate debe ser una fecha válida' })
    @IsNotEmpty({ message: 'maintenanceDate es requerido' })
    maintenanceDate: string;

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
    @IsNumber({}, { message: 'performedById debe ser un número' })
    @Transform(({ value }) => value !== undefined && value !== null ? parseInt(value, 10) : undefined)
    performedById?: number;

    @IsOptional()
    @IsString({ message: 'invoiceNumber debe ser texto' })
    @MaxLength(100, { message: 'invoiceNumber no puede exceder 100 caracteres' })
    invoiceNumber?: string;

    @IsOptional()
    @IsString({ message: 'provider debe ser texto' })
    @MaxLength(150, { message: 'provider no puede exceder 150 caracteres' })
    provider?: string;

    @IsOptional()
    @IsNumber({}, { message: 'mileageAtMaintenance debe ser un número' })
    @Min(0, { message: 'mileageAtMaintenance debe ser mayor o igual a cero' })
    @Transform(({ value }) => value !== undefined && value !== null ? parseFloat(value) : undefined)
    mileageAtMaintenance?: number;

    @IsOptional()
    @IsBoolean({ message: 'requiresFollowUp debe ser un booleano' })
    requiresFollowUp?: boolean;
}
