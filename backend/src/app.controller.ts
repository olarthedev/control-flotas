import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { AppService } from './app.service';
import { User } from './users/user.entity';
import { Vehicle } from './vehicles/vehicle.entity';
import { Trip } from './trips/trip.entity';
import { Expense, ExpenseStatus, ExpenseType } from './expenses/expense.entity';
import { Consignment, ConsignmentStatus } from './consignments/consignment.entity';

interface DashboardSummaryResponse {
  totalConsigned: number;
  totalApproved: number;
  balance: number;
  pendingCount: number;
  trends: {
    consigned: number;
    approved: number;
  };
}

interface WeeklyTrendItem {
  day: string;
  consignado: number;
  gastos: number;
}

interface WeekSlot {
  label: string;
  dateKey: string;
}

interface DistributionItem {
  name: string;
  amount: number;
  percentage: number;
}

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepo: Repository<Vehicle>,
    @InjectRepository(Trip)
    private readonly tripRepo: Repository<Trip>,
    @InjectRepository(Expense)
    private readonly expenseRepo: Repository<Expense>,
    @InjectRepository(Consignment)
    private readonly consignmentRepo: Repository<Consignment>,
  ) { }

  private getMonthRange(referenceDate: Date): { start: Date; end: Date } {
    const start = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    const end = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1);
    return { start, end };
  }

  private getWeekRange(referenceDate: Date): { start: Date; end: Date } {
    const start = new Date(referenceDate);
    const day = start.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    start.setDate(start.getDate() + diffToMonday);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start, end };
  }

  private calculateTrend(current: number, previous: number): number {
    if (previous === 0) {
      return current === 0 ? 0 : 100;
    }
    return Number((((current - previous) / previous) * 100).toFixed(1));
  }

  private getDistributionLabel(type: ExpenseType): string {
    const labels: Record<ExpenseType, string> = {
      FUEL: 'COMBUSTIBLE',
      MAINTENANCE: 'MANTENIMIENTO',
      TOLLS: 'PEAJES',
      LOADING_UNLOADING: 'CARGA/DESCARGA',
      MEALS: 'COMIDAS',
      PARKING: 'PARQUEADERO',
      OTHER: 'OTROS',
    };

    return labels[type] ?? String(type);
  }

  private getLast7DaysSlots(referenceDate = new Date()): { start: Date; end: Date; slots: WeekSlot[] } {
    const end = new Date(referenceDate);
    end.setHours(23, 59, 59, 999);

    const start = new Date(referenceDate);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const dayLabels = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const slots: WeekSlot[] = [];

    for (let i = 0; i < 7; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      const label = dayLabels[current.getDay()];
      const dateKey = this.toLocalDateKey(current);
      slots.push({ label, dateKey });
    }

    return { start, end, slots };
  }

  private toLocalDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * GET /
   * Health check / greeting endpoint.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * GET /metrics
   * Return simple aggregate counts for dashboard use.
   */
  @Get('metrics')
  async getMetrics() {
    const [users, vehicles, trips] = await Promise.all([
      this.userRepo.count(),
      this.vehicleRepo.count(),
      this.tripRepo.count(),
    ]);
    return { users, vehicles, trips };
  }

  @Get('dashboard/summary')
  async getDashboardSummary(): Promise<DashboardSummaryResponse> {
    const now = new Date();
    const { start: currentMonthStart, end: currentMonthEnd } = this.getMonthRange(now);
    const { start: previousMonthStart, end: previousMonthEnd } = this.getMonthRange(
      new Date(now.getFullYear(), now.getMonth() - 1, 1),
    );

    const [
      activeConsignments,
      approvedCurrentMonth,
      pendingCount,
      currentMonthConsignments,
      previousMonthConsignments,
      previousMonthApproved,
    ] = await Promise.all([
      this.consignmentRepo.find({ where: { status: ConsignmentStatus.ACTIVE } }),
      this.expenseRepo.find({
        where: {
          status: ExpenseStatus.APPROVED,
          expenseDate: Between(currentMonthStart, currentMonthEnd),
        },
      }),
      this.expenseRepo.count({ where: { status: ExpenseStatus.PENDING } }),
      this.consignmentRepo.find({
        where: {
          consignmentDate: Between(currentMonthStart, currentMonthEnd),
        },
      }),
      this.consignmentRepo.find({
        where: {
          consignmentDate: Between(previousMonthStart, previousMonthEnd),
        },
      }),
      this.expenseRepo.find({
        where: {
          status: ExpenseStatus.APPROVED,
          expenseDate: Between(previousMonthStart, previousMonthEnd),
        },
      }),
    ]);

    const totalConsigned = activeConsignments.reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
    const totalApproved = approvedCurrentMonth.reduce((sum, item) => sum + Number(item.amount ?? 0), 0);

    const currentConsignedTotal = currentMonthConsignments.reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
    const previousConsignedTotal = previousMonthConsignments.reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
    const previousApprovedTotal = previousMonthApproved.reduce((sum, item) => sum + Number(item.amount ?? 0), 0);

    return {
      totalConsigned,
      totalApproved,
      balance: totalConsigned - totalApproved,
      pendingCount,
      trends: {
        consigned: this.calculateTrend(currentConsignedTotal, previousConsignedTotal),
        approved: this.calculateTrend(totalApproved, previousApprovedTotal),
      },
    };
  }

  @Get('dashboard/weekly-trend')
  async getWeeklyTrend(): Promise<WeeklyTrendItem[]> {
    const { start, end, slots } = this.getLast7DaysSlots(new Date());

    const [weekConsignments, weekApprovedExpenses] = await Promise.all([
      this.consignmentRepo.find({
        where: {
          createdAt: Between(start, end),
        },
      }),
      this.expenseRepo
        .createQueryBuilder('expense')
        .where('expense.status = :status', { status: ExpenseStatus.APPROVED })
        .andWhere(
          '(expense.validatedAt BETWEEN :start AND :end OR (expense.validatedAt IS NULL AND expense.updatedAt BETWEEN :start AND :end))',
          { start, end },
        )
        .getMany(),
    ]);

    const base = slots.map((slot) => ({ day: slot.label, consignado: 0, gastos: 0 }));
    const slotByDate = new Map(slots.map((slot, index) => [slot.dateKey, index]));

    weekConsignments.forEach((item) => {
      const dateKey = this.toLocalDateKey(new Date(item.createdAt));
      const slotIndex = slotByDate.get(dateKey);
      if (slotIndex !== undefined) {
        base[slotIndex].consignado += Number(item.amount ?? 0);
      }
    });

    weekApprovedExpenses.forEach((item) => {
      const sourceDate = item.validatedAt ?? item.updatedAt;
      const dateKey = this.toLocalDateKey(new Date(sourceDate));
      const slotIndex = slotByDate.get(dateKey);
      if (slotIndex !== undefined) {
        base[slotIndex].gastos += Number(item.amount ?? 0);
      }
    });

    return base;
  }

  @Get('dashboard/expense-distribution')
  async getExpenseDistribution(): Promise<DistributionItem[]> {
    const now = new Date();
    const { start, end } = this.getMonthRange(now);

    const approvedExpenses = await this.expenseRepo.find({
      where: {
        status: ExpenseStatus.APPROVED,
        expenseDate: Between(start, end),
      },
    });

    const totalsByType = new Map<string, number>();

    approvedExpenses.forEach((expense) => {
      const key = this.getDistributionLabel(expense.type);
      const current = totalsByType.get(key) ?? 0;
      totalsByType.set(key, current + Number(expense.amount ?? 0));
    });

    const grandTotal = Array.from(totalsByType.values()).reduce((sum, amount) => sum + amount, 0);

    if (grandTotal === 0) {
      return [];
    }

    return Array.from(totalsByType.entries())
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: Number(((amount / grandTotal) * 100).toFixed(1)),
      }))
      .sort((a, b) => b.amount - a.amount);
  }
}
