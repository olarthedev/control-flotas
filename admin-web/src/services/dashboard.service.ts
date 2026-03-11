import axios from 'axios';
import { apiConfig } from '../config/api';

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

/**
 * IMPORTANTE: Este endpoint debe ser implementado en el backend.
 * El frontend NO debe hacer cálculos complejos de negocio.
 * 
 * El backend debe retornar este resumen pre-calculado considerando:
 * - Todas las consignaciones activas (ACTIVE status)
 * - Todos los gastos aprobados del mes actual
 * - El balance = consignado - aprobado
 * - El conteo de gastos pendientes
 * - Las tendencias comparadas con el mes anterior
 */
export async function fetchDashboardSummary(): Promise<DashboardSummary> {
    const { data } = await axios.get<DashboardSummary>(
        `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.DASHBOARD_SUMMARY}`
    );
    return data;
}

export async function fetchWeeklyTrend(): Promise<WeeklyTrendPoint[]> {
    const { data } = await axios.get<WeeklyTrendPoint[]>(
        `${apiConfig.BASE_URL}/dashboard/weekly-trend`
    );
    return data;
}

export async function fetchExpenseDistribution(): Promise<ExpenseDistributionPoint[]> {
    const { data } = await axios.get<ExpenseDistributionPoint[]>(
        `${apiConfig.BASE_URL}/dashboard/expense-distribution`
    );
    return data;
}
