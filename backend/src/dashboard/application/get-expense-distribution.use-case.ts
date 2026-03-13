import { Inject, Injectable } from '@nestjs/common';
import { DASHBOARD_READ_REPOSITORY } from '../domain/dashboard-read.repository';
import type { DashboardReadRepository } from '../domain/dashboard-read.repository';
import { ExpenseDistributionPoint } from '../domain/dashboard.types';
import { getMonthRange } from './date-range.util';

const DISTRIBUTION_LABELS: Record<string, string> = {
    FUEL: 'COMBUSTIBLE',
    MAINTENANCE: 'MANTENIMIENTO',
    TOLLS: 'PEAJES',
    LOADING_UNLOADING: 'CARGA/DESCARGA',
    MEALS: 'COMIDAS',
    PARKING: 'PARQUEADERO',
    OTHER: 'OTROS',
};

@Injectable()
export class GetExpenseDistributionUseCase {
    constructor(
        @Inject(DASHBOARD_READ_REPOSITORY)
        private readonly dashboardReadRepository: DashboardReadRepository,
    ) { }

    async execute(referenceDate = new Date()): Promise<ExpenseDistributionPoint[]> {
        const { start, end } = getMonthRange(referenceDate);
        const totals = await this.dashboardReadRepository.getApprovedExpenseTotalsByTypeInRange(start, end);

        const grandTotal = totals.reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
        if (grandTotal === 0) {
            return [];
        }

        return totals
            .map((item) => ({
                name: DISTRIBUTION_LABELS[item.type] ?? item.type,
                amount: Number(item.amount ?? 0),
                percentage: Number(((Number(item.amount ?? 0) / grandTotal) * 100).toFixed(1)),
            }))
            .sort((first, second) => second.amount - first.amount);
    }
}
