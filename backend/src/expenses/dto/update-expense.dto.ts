import { PartialType } from '@nestjs/mapped-types';
import { CreateExpenseDto } from './create-expense.dto';
import { ExpenseStatus } from '../expense.entity';

export class UpdateExpenseDto extends PartialType(CreateExpenseDto) {
  status?: ExpenseStatus;
  rejectionReason?: string;
  validatedAt?: Date;
  validatedBy?: string;
}
