import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class AssignDriverVehicleDto {
    @Transform(({ value }) => {
        if (value === '' || value === undefined) {
            return null;
        }

        if (value === null) {
            return null;
        }

        return parseInt(value, 10);
    })
    @ValidateIf((object) => object.assignedVehicleId !== null)
    @IsNumber({}, { message: 'assignedVehicleId debe ser numérico' })
    assignedVehicleId: number | null;

    @IsString({ message: 'assignmentChangeReason debe ser texto' })
    @IsNotEmpty({ message: 'assignmentChangeReason es requerido cuando hay cambio de furgón' })
    @MaxLength(500, { message: 'assignmentChangeReason no puede exceder 500 caracteres' })
    assignmentChangeReason: string;

    @IsOptional()
    @IsDateString({}, { message: 'assignmentEffectiveAt debe ser una fecha ISO válida' })
    assignmentEffectiveAt?: string;

    @IsOptional()
    @IsString({ message: 'changedBy debe ser texto' })
    @MaxLength(100, { message: 'changedBy no puede exceder 100 caracteres' })
    changedBy?: string;
}
