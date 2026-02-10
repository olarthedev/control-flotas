import { PartialType } from '@nestjs/mapped-types';
import { CreateConsignmentDto } from './create-consignment.dto';

export class UpdateConsignmentDto extends PartialType(CreateConsignmentDto) {
  status?: 'ACTIVE' | 'CLOSED' | 'DISPUTED';
  closingDate?: Date;
  closingNotes?: string;
}
