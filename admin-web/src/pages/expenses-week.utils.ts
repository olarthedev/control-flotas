import type { ExpenseItem, ExpenseStatus } from '../services/expenses.service';

export interface HistoryWeekSummary {
    weekKey: string;
    isoWeek: number;
    isoYear: number;
    approvedCount: number;
    rejectedCount: number;
    totalAmount: number;
    hasActiveItems: boolean;
}

export interface OpenWeekSummary {
    weekKey: string;
    isoWeek: number;
    isoYear: number;
    activeCount: number;
}

export function getStartOfWeek(date = new Date()): Date {
    const copy = new Date(date);
    const day = copy.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    copy.setDate(copy.getDate() + diff);
    copy.setHours(0, 0, 0, 0);
    return copy;
}

export function toLocalDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export function toWeekKey(date: Date): string {
    return toLocalDateKey(date);
}

export function getCurrentWeekKey(referenceDate = new Date()): string {
    return toWeekKey(getStartOfWeek(referenceDate));
}

export function getIsoWeekInfo(date: Date): { isoWeek: number; isoYear: number } {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNumber = utcDate.getUTCDay() || 7;
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNumber);

    const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
    const dayOffset = Math.floor((utcDate.getTime() - yearStart.getTime()) / 86400000);
    const isoWeek = Math.ceil((dayOffset + 1) / 7);

    return {
        isoWeek,
        isoYear: utcDate.getUTCFullYear(),
    };
}

export function getWeekRange(weekKey: string): { start: Date; end: Date } {
    const start = new Date(`${weekKey}T00:00:00`);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start, end };
}

export function isDateWithinWeek(value: string, weekKey: string): boolean {
    const { start, end } = getWeekRange(weekKey);
    const date = new Date(value);
    return date >= start && date < end;
}

export function getWeekLabel(weekKey: string): string {
    const { start, end } = getWeekRange(weekKey);
    const endVisible = new Date(end);
    endVisible.setDate(endVisible.getDate() - 1);
    return `${start.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })} - ${endVisible.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}`;
}

export function buildHistoryWeekSummaries(
    expenses: ExpenseItem[],
    activeStatuses: ExpenseStatus[],
): HistoryWeekSummary[] {
    const summaryByWeek = new Map<string, HistoryWeekSummary>();

    expenses.forEach((expense) => {
        const weekKey = toWeekKey(getStartOfWeek(new Date(expense.expenseDate)));
        if (!summaryByWeek.has(weekKey)) {
            const { isoWeek, isoYear } = getIsoWeekInfo(new Date(`${weekKey}T00:00:00`));
            summaryByWeek.set(weekKey, {
                weekKey,
                isoWeek,
                isoYear,
                approvedCount: 0,
                rejectedCount: 0,
                totalAmount: 0,
                hasActiveItems: false,
            });
        }

        const summary = summaryByWeek.get(weekKey)!;

        if (activeStatuses.includes(expense.status)) {
            summary.hasActiveItems = true;
            return;
        }

        if (expense.status === 'APPROVED') {
            summary.approvedCount += 1;
            summary.totalAmount += expense.amount;
        }

        if (expense.status === 'REJECTED') {
            summary.rejectedCount += 1;
        }
    });

    return Array.from(summaryByWeek.values())
        .filter((summary) => !summary.hasActiveItems && (summary.approvedCount > 0 || summary.rejectedCount > 0))
        .sort((first, second) => (first.weekKey < second.weekKey ? 1 : -1));
}

export function buildOpenWeekSummaries(
    expenses: ExpenseItem[],
    activeStatuses: ExpenseStatus[],
): OpenWeekSummary[] {
    const summaryByWeek = new Map<string, OpenWeekSummary>();

    expenses.forEach((expense) => {
        if (!activeStatuses.includes(expense.status)) {
            return;
        }

        const weekKey = toWeekKey(getStartOfWeek(new Date(expense.expenseDate)));
        if (!summaryByWeek.has(weekKey)) {
            const { isoWeek, isoYear } = getIsoWeekInfo(new Date(`${weekKey}T00:00:00`));
            summaryByWeek.set(weekKey, {
                weekKey,
                isoWeek,
                isoYear,
                activeCount: 0,
            });
        }

        const summary = summaryByWeek.get(weekKey)!;
        summary.activeCount += 1;
    });

    return Array.from(summaryByWeek.values()).sort((first, second) => (first.weekKey > second.weekKey ? 1 : -1));
}

export function filterExpensesByWeekAndStatuses(
    expenses: ExpenseItem[],
    weekKey: string,
    allowedStatuses: ExpenseStatus[],
): ExpenseItem[] {
    const expensesInWeek = expenses.filter((expense) => isDateWithinWeek(expense.expenseDate, weekKey));
    return expensesInWeek.filter((expense) => allowedStatuses.includes(expense.status));
}
