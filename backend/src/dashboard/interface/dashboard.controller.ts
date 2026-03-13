import { Controller, Get } from '@nestjs/common';
import { GetDashboardSummaryUseCase } from '../application/get-dashboard-summary.use-case';
import { GetWeeklyTrendUseCase } from '../application/get-weekly-trend.use-case';
import { GetExpenseDistributionUseCase } from '../application/get-expense-distribution.use-case';

@Controller('dashboard')
export class DashboardController {
    constructor(
        private readonly getDashboardSummaryUseCase: GetDashboardSummaryUseCase,
        private readonly getWeeklyTrendUseCase: GetWeeklyTrendUseCase,
        private readonly getExpenseDistributionUseCase: GetExpenseDistributionUseCase,
    ) { }

    @Get('summary')
    getSummary() {
        return this.getDashboardSummaryUseCase.execute();
    }

    @Get('weekly-trend')
    getWeeklyTrend() {
        return this.getWeeklyTrendUseCase.execute();
    }

    @Get('expense-distribution')
    getExpenseDistribution() {
        return this.getExpenseDistributionUseCase.execute();
    }
}
