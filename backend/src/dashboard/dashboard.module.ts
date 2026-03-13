import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consignment } from '../consignments/consignment.entity';
import { Expense } from '../expenses/expense.entity';
import { GetDashboardSummaryUseCase } from './application/get-dashboard-summary.use-case';
import { GetExpenseDistributionUseCase } from './application/get-expense-distribution.use-case';
import { GetWeeklyTrendUseCase } from './application/get-weekly-trend.use-case';
import { DASHBOARD_READ_REPOSITORY } from './domain/dashboard-read.repository';
import { TypeOrmDashboardReadRepository } from './infrastructure/typeorm-dashboard-read.repository';
import { DashboardController } from './interface/dashboard.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Expense, Consignment])],
    controllers: [DashboardController],
    providers: [
        GetDashboardSummaryUseCase,
        GetWeeklyTrendUseCase,
        GetExpenseDistributionUseCase,
        {
            provide: DASHBOARD_READ_REPOSITORY,
            useClass: TypeOrmDashboardReadRepository,
        },
    ],
})
export class DashboardModule { }
