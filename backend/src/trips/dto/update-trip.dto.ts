import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsDateString, IsEnum, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';
import { CreateTripDto } from './create-trip.dto';
import { TripStatus } from '../trip.entity';

export class UpdateTripDto extends PartialType(CreateTripDto) {
    @IsOptional()
    @IsEnum(TripStatus, { message: 'status debe ser: planned, in_progress, completed o cancelled' })
    status?: TripStatus;

    @IsOptional()
    @IsDateString({}, { message: 'endDate debe ser una fecha válida' })
    endDate?: string;

    @IsOptional()
    @IsNumber({}, { message: 'endMileage debe ser un número' })
    @Transform(({ value }) => value !== undefined && value !== null ? parseFloat(value) : undefined)
    endMileage?: number;
}
