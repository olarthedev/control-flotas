import { Inject, Injectable } from '@nestjs/common';
import { DASHBOARD_READ_REPOSITORY } from '../domain/dashboard-read.repository';
import type { DashboardReadRepository } from '../domain/dashboard-read.repository';
import { DashboardSummary } from '../domain/dashboard.types';
import { calculateTrend, getMonthRange } from './date-range.util';

@Injectable()
export class GetDashboardSummaryUseCase {
    constructor(
        @Inject(DASHBOARD_READ_REPOSITORY)
        private readonly dashboardReadRepository: DashboardReadRepository,
    ) { }

    async execute(referenceDate = new Date()): Promise<DashboardSummary> {
        const { start: currentMonthStart, end: currentMonthEnd } = getMonthRange(referenceDate);
        const { start: previousMonthStart, end: previousMonthEnd } = getMonthRange(
            new Date(referenceDate.getFullYear(), referenceDate.getMonth() - 1, 1),
        );

        const [
            totalConsigned,
            totalApproved,
            pendingCount,
            currentMonthConsigned,
            previousMonthConsigned,
            previousMonthApproved,
        ] = await Promise.all([
            this.dashboardReadRepository.getActiveConsignedTotal(),
            this.dashboardReadRepository.getApprovedExpensesTotalInRange(currentMonthStart, currentMonthEnd),
            this.dashboardReadRepository.countPendingExpenses(),
            this.dashboardReadRepository.getConsignedTotalInRange(currentMonthStart, currentMonthEnd),
            this.dashboardReadRepository.getConsignedTotalInRange(previousMonthStart, previousMonthEnd),
            this.dashboardReadRepository.getApprovedExpensesTotalInRange(previousMonthStart, previousMonthEnd),
        ]);

        return {
            totalConsigned,
            totalApproved,
            balance: totalConsigned - totalApproved,
            pendingCount,
            trends: {
                consigned: calculateTrend(currentMonthConsigned, previousMonthConsigned),
                approved: calculateTrend(totalApproved, previousMonthApproved),
            },
        };
    }
}
