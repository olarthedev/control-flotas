import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsDateString, IsString, MaxLength } from 'class-validator';
import { CreateConsignmentDto } from './create-consignment.dto';
import { ConsignmentStatus } from '../consignment.entity';

export class UpdateConsignmentDto extends PartialType(CreateConsignmentDto) {
    @IsOptional()
    @IsEnum(ConsignmentStatus, { message: 'status debe ser ACTIVE, CLOSED o DISPUTED' })
    status?: ConsignmentStatus;

    @IsOptional()
    @IsDateString({}, { message: 'closingDate debe ser una fecha válida' })
    closingDate?: string;

    @IsOptional()
    @IsString({ message: 'closingNotes debe ser texto' })
    @MaxLength(1000, { message: 'closingNotes no puede exceder 1000 caracteres' })
    closingNotes?: string;
}
