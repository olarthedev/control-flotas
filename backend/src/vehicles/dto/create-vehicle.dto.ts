import { IsString, IsNotEmpty, MinLength, MaxLength, IsOptional, IsDateString } from 'class-validator';

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

    @IsString({ message: 'type debe ser texto' })
    @IsNotEmpty({ message: 'type es requerido' })
    type: string;

    @IsOptional()
    @IsDateString({}, { message: 'soatExpiryDate debe ser una fecha válida' })
    soatExpiryDate?: string;

    @IsOptional()
    @IsDateString({}, { message: 'technicalReviewExpiryDate debe ser una fecha válida' })
    technicalReviewExpiryDate?: string;

    @IsOptional()
    @IsDateString({}, { message: 'insuranceExpiryDate debe ser una fecha válida' })
    insuranceExpiryDate?: string;

    @IsOptional()
    @IsString({ message: 'documentNotes debe ser texto' })
    documentNotes?: string;
}
