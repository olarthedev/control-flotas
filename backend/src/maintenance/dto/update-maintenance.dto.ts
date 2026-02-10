import { PartialType } from '@nestjs/mapped-types';
import { CreateMaintenanceDto } from './create-maintenance.dto';

export class UpdateMaintenanceDto extends PartialType(CreateMaintenanceDto) {
  status?: 'COMPLETED' | 'PENDING' | 'SCHEDULED';
  requiresFollowUp?: boolean;
  followUpNotes?: string;
}
