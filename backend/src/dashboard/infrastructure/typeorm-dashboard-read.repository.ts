import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consignment, ConsignmentStatus } from '../../consignments/consignment.entity';
import { Expense, ExpenseStatus } from '../../expenses/expense.entity';
import { DashboardReadRepository } from '../domain/dashboard-read.repository';
import { DailyAmountPoint, TypeAmountPoint } from '../domain/dashboard.types';

interface AmountRow {
    total: string | number | null;
}

interface TypeAmountRow {
    type: string;
    total: string | number;
}

interface DateAmountRow {
    date: Date;
    amount: string | number;
}

@Injectable()
export class TypeOrmDashboardReadRepository implements DashboardReadRepository {
    constructor(
        @InjectRepository(Expense)
        private readonly expenseRepository: Repository<Expense>,
        @InjectRepository(Consignment)
        private readonly consignmentRepository: Repository<Consignment>,
    ) { }

    async getActiveConsignedTotal(): Promise<number> {
        const row = await this.consignmentRepository
            .createQueryBuilder('consignment')
            .select('COALESCE(SUM(consignment.amount), 0)', 'total')
            .where('consignment.status = :status', { status: ConsignmentStatus.ACTIVE })
            .getRawOne<AmountRow>();

        return this.toNumber(row?.total);
    }

    async getConsignedTotalInRange(start: Date, end: Date): Promise<number> {
        const row = await this.consignmentRepository
            .createQueryBuilder('consignment')
            .select('COALESCE(SUM(consignment.amount), 0)', 'total')
            .where('consignment.consignmentDate BETWEEN :start AND :end', { start, end })
            .getRawOne<AmountRow>();

        return this.toNumber(row?.total);
    }

    async getApprovedExpensesTotalInRange(start: Date, end: Date): Promise<number> {
        const row = await this.expenseRepository
            .createQueryBuilder('expense')
            .select('COALESCE(SUM(expense.amount), 0)', 'total')
            .where('expense.status = :status', { status: ExpenseStatus.APPROVED })
            .andWhere('expense.expenseDate BETWEEN :start AND :end', { start, end })
            .getRawOne<AmountRow>();

        return this.toNumber(row?.total);
    }

    async countPendingExpenses(): Promise<number> {
        return this.expenseRepository.count({ where: { status: ExpenseStatus.PENDING } });
    }

    async getConsignmentsCreatedInRange(start: Date, end: Date): Promise<DailyAmountPoint[]> {
        const rows = await this.consignmentRepository
            .createQueryBuilder('consignment')
            .select('consignment.createdAt', 'date')
            .addSelect('consignment.amount', 'amount')
            .where('consignment.createdAt BETWEEN :start AND :end', { start, end })
            .getRawMany<DateAmountRow>();

        return rows.map((row) => ({
            date: new Date(row.date),
            amount: this.toNumber(row.amount),
        }));
    }

    async getApprovedExpensesValidatedOrUpdatedInRange(start: Date, end: Date): Promise<DailyAmountPoint[]> {
        const rows = await this.expenseRepository
            .createQueryBuilder('expense')
            .select('COALESCE(expense.validatedAt, expense.updatedAt)', 'date')
            .addSelect('expense.amount', 'amount')
            .where('expense.status = :status', { status: ExpenseStatus.APPROVED })
            .andWhere(
                '(expense.validatedAt BETWEEN :start AND :end OR (expense.validatedAt IS NULL AND expense.updatedAt BETWEEN :start AND :end))',
                { start, end },
            )
            .getRawMany<DateAmountRow>();

        return rows.map((row) => ({
            date: new Date(row.date),
            amount: this.toNumber(row.amount),
        }));
    }

    async getApprovedExpenseTotalsByTypeInRange(start: Date, end: Date): Promise<TypeAmountPoint[]> {
        const rows = await this.expenseRepository
            .createQueryBuilder('expense')
            .select('expense.type', 'type')
            .addSelect('COALESCE(SUM(expense.amount), 0)', 'total')
            .where('expense.status = :status', { status: ExpenseStatus.APPROVED })
            .andWhere('expense.expenseDate BETWEEN :start AND :end', { start, end })
            .groupBy('expense.type')
            .getRawMany<TypeAmountRow>();

        return rows.map((row) => ({
            type: row.type,
            amount: this.toNumber(row.total),
        }));
    }

    private toNumber(value: string | number | null | undefined): number {
        const parsed = Number(value ?? 0);
        return Number.isFinite(parsed) ? parsed : 0;
    }
}
