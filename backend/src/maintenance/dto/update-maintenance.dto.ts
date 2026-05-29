import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsEnum } from 'class-validator';
import { CreateMaintenanceDto } from './create-maintenance.dto';
import { MaintenanceStatus } from '../maintenance-record.entity';

export class UpdateMaintenanceDto extends PartialType(CreateMaintenanceDto) {
    @IsOptional()
    @IsEnum(MaintenanceStatus, { message: 'status debe ser: scheduled, in_progress, completed o cancelled' })
    status?: MaintenanceStatus;
}
