export interface DashboardSummary {
    totalConsigned: number;
    totalApproved: number;
    balance: number;
    pendingCount: number;
    trends: {
        consigned: number;
        approved: number;
    };
}

export interface WeeklyTrendPoint {
    day: string;
    consignado: number;
    gastos: number;
}

export interface ExpenseDistributionPoint {
    name: string;
    amount: number;
    percentage: number;
}

export interface DailyAmountPoint {
    date: Date;
    amount: number;
}

export interface TypeAmountPoint {
    type: string;
    amount: number;
}
