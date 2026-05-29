import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsDateString } from 'class-validator';
import { CreateConsignmentDto } from './create-consignment.dto';
import { ConsignmentStatus } from '../consignment.entity';

export class UpdateConsignmentDto extends PartialType(CreateConsignmentDto) {
    @IsOptional()
    @IsEnum(ConsignmentStatus, { message: 'status debe ser: open, closed o pending_approval' })
    status?: ConsignmentStatus;

    @IsOptional()
    @IsDateString({}, { message: 'closingDate debe ser una fecha válida' })
    closingDate?: string;
}
