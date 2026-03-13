import { DailyAmountPoint, TypeAmountPoint } from './dashboard.types';

export const DASHBOARD_READ_REPOSITORY = 'DASHBOARD_READ_REPOSITORY';

export interface DashboardReadRepository {
    getActiveConsignedTotal(): Promise<number>;
    getConsignedTotalInRange(start: Date, end: Date): Promise<number>;
    getApprovedExpensesTotalInRange(start: Date, end: Date): Promise<number>;
    countPendingExpenses(): Promise<number>;
    getConsignmentsCreatedInRange(start: Date, end: Date): Promise<DailyAmountPoint[]>;
    getApprovedExpensesValidatedOrUpdatedInRange(start: Date, end: Date): Promise<DailyAmountPoint[]>;
    getApprovedExpenseTotalsByTypeInRange(start: Date, end: Date): Promise<TypeAmountPoint[]>;
}
