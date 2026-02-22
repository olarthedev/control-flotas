import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsDateString, IsString, IsEnum } from 'class-validator';
import { CreateTripDto } from './create-trip.dto';

export class UpdateTripDto extends PartialType(CreateTripDto) {
    @IsOptional()
    @IsEnum(['IN_PROGRESS', 'COMPLETED', 'CANCELLED'], {
        message: 'status debe ser IN_PROGRESS, COMPLETED o CANCELLED',
    })
    status?: string;

    @IsOptional()
    @IsDateString({}, { message: 'endDate debe ser una fecha válida' })
    endDate?: string; // keep as string for validation
}
