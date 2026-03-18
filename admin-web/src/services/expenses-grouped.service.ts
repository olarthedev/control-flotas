import axios from 'axios';
import { normalizeExpense, type ExpenseItem } from './expenses.service';
import { apiConfig } from '../config/api';

export interface VehicleExpenseSummary {
    vehicleId: number;
    licensePlate: string;
    brand: string;
    model: string;
    driverId: number;
    driverName: string;
    totalExpenses: number;
    monthlyTotal: number;
    pendingCount: number;
    approvedCount: number;
    observedCount: number;
    rejectedCount: number;
    lastExpenseDate: string | null;
}

export interface VehicleExpensesDetail {
    vehicle: {
        id: number;
        licensePlate: string;
        brand: string;
        model: string;
    };
    driver: {
        id: number;
        fullName: string;
    };
    expenses: ExpenseItem[];
}

export interface ExpensesByVehicleFilters {
    dateFrom?: string;
    dateTo?: string;
    statuses?: string[];
}

export async function fetchAllVehiclesWithExpensesSummary(): Promise<VehicleExpenseSummary[]> {
    const { data } = await axios.get<VehicleExpenseSummary[]>(
        `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.EXPENSES_SUMMARY_BY_VEHICLE}`,
    );

    return Array.isArray(data) ? data : [];
}

/**
 * Legacy function - kept for compatibility
 * Use fetchAllVehiclesWithExpensesSummary() instead
 */
export async function fetchExpensesGroupedByVehicle(): Promise<VehicleExpenseSummary[]> {
    return fetchAllVehiclesWithExpensesSummary();
}

export async function fetchExpensesByVehicle(
    vehicleId: number,
    filters?: ExpensesByVehicleFilters,
): Promise<ExpenseItem[]> {
    const query = new URLSearchParams();
    if (filters?.dateFrom) {
        query.set('dateFrom', filters.dateFrom);
    }

    if (filters?.dateTo) {
        query.set('dateTo', filters.dateTo);
    }

    if (filters?.statuses?.length) {
        query.set('statuses', filters.statuses.join(','));
    }

    const querySuffix = query.toString() ? `?${query.toString()}` : '';

    const { data } = await axios.get<any[]>(
        `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.EXPENSES_BY_VEHICLE(vehicleId)}${querySuffix}`,
    );
    return data.map(normalizeExpense);
}
