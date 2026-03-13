import { Inject, Injectable } from '@nestjs/common';
import { DASHBOARD_READ_REPOSITORY } from '../domain/dashboard-read.repository';
import type { DashboardReadRepository } from '../domain/dashboard-read.repository';
import { WeeklyTrendPoint } from '../domain/dashboard.types';
import { getLast7DaysSlots, toLocalDateKey } from './date-range.util';

@Injectable()
export class GetWeeklyTrendUseCase {
    constructor(
        @Inject(DASHBOARD_READ_REPOSITORY)
        private readonly dashboardReadRepository: DashboardReadRepository,
    ) { }

    async execute(referenceDate = new Date()): Promise<WeeklyTrendPoint[]> {
        const { start, end, slots } = getLast7DaysSlots(referenceDate);

        const [consignments, approvedExpenses] = await Promise.all([
            this.dashboardReadRepository.getConsignmentsCreatedInRange(start, end),
            this.dashboardReadRepository.getApprovedExpensesValidatedOrUpdatedInRange(start, end),
        ]);

        const trend = slots.map((slot) => ({ day: slot.label, consignado: 0, gastos: 0 }));
        const slotByDate = new Map(slots.map((slot, index) => [slot.dateKey, index]));

        for (const consignment of consignments) {
            const slotIndex = slotByDate.get(toLocalDateKey(new Date(consignment.date)));
            if (slotIndex !== undefined) {
                trend[slotIndex].consignado += Number(consignment.amount ?? 0);
            }
        }

        for (const expense of approvedExpenses) {
            const slotIndex = slotByDate.get(toLocalDateKey(new Date(expense.date)));
            if (slotIndex !== undefined) {
                trend[slotIndex].gastos += Number(expense.amount ?? 0);
            }
        }

        return trend;
    }
}
