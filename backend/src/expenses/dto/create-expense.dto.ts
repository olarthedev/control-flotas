import { ExpenseType, ExpenseStatus } from '../expense.entity';

export class CreateExpenseDto {
  type: ExpenseType;
  amount: number;
  expenseDate: Date;
  description?: string;
  notes?: string;
  driverId: number;
  vehicleId?: number;
  tripId?: number;
}
