import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsEnum, IsBoolean, IsString, MaxLength } from 'class-validator';
import { CreateMaintenanceDto } from './create-maintenance.dto';

export class UpdateMaintenanceDto extends PartialType(CreateMaintenanceDto) {
    @IsOptional()
    @IsEnum(['COMPLETED', 'PENDING', 'SCHEDULED'], {
        message: 'status debe ser COMPLETED, PENDING o SCHEDULED',
    })
    status?: 'COMPLETED' | 'PENDING' | 'SCHEDULED';

    @IsOptional()
    @IsBoolean({ message: 'requiresFollowUp debe ser un booleano' })
    requiresFollowUp?: boolean;

    @IsOptional()
    @IsString({ message: 'followUpNotes debe ser texto' })
    @MaxLength(1000, { message: 'followUpNotes no puede exceder 1000 caracteres' })
    followUpNotes?: string;
}
