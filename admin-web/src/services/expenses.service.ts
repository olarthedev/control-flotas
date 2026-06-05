import axios from 'axios';
import { apiConfig } from '../config/api';

export type ExpenseStatus = 'pending' | 'approved' | 'rejected';
export type ExpenseType = 'fuel' | 'toll' | 'maintenance' | 'food' | 'lodging' | 'parking' | 'other';

export interface ExpenseEvidence {
    id: number;
    fileUrl: string;
    isPrimary: boolean;
}

export interface ExpenseTripInfo {
    id: number;
    origin: string;
    destination: string;
}

export interface ExpenseItem {
    id: number;
    type: ExpenseType;
    amount: number;
    expenseDate: string;
    description: string | null;
    status: ExpenseStatus;
    rejectionReason: string | null;
    driver: {
        id: number;
        fullName: string;
    };
    vehicle: {
        id: number;
        licensePlate: string;
        brand?: string;
        model?: string;
    } | null;
    evidence: ExpenseEvidence[];
    trip: ExpenseTripInfo | null;
}

export interface DriverLiquidationByVehicleItem {
    vehicleId: number;
    licensePlate: string;
    brand: string;
    model: string;
    totalExpenses: number;
}

export interface DriverLiquidationResponse {
    driverId: number;
    dateFrom: string;
    dateTo: string;
    totalExpenses: number;
    totalByVehicle: DriverLiquidationByVehicleItem[];
}

interface ExpenseResponse {
    id: number;
    type: ExpenseType;
    amount: number | string;
    expenseDate: string;
    description: string | null;
    status: ExpenseStatus;
    rejectionReason: string | null;
    driver: {
        id: number;
        fullName: string;
    };
    vehicle: {
        id: number;
        licensePlate: string;
        brand?: string;
        model?: string;
    } | null;
    evidence?: Array<{
        id: number;
        fileUrl: string;
        isPrimary: boolean;
    }>;
    trip?: {
        id: number;
        origin: string;
        destination: string;
    } | null;
}

export function normalizeExpense(item: ExpenseResponse): ExpenseItem {
    return {
        id: item.id,
        type: item.type,
        amount: Number(item.amount ?? 0),
        expenseDate: item.expenseDate,
        description: item.description,
        status: item.status,
        rejectionReason: item.rejectionReason,
        driver: item.driver,
        vehicle: item.vehicle,
        evidence: item.evidence ?? [],
        trip: item.trip
            ? { id: item.trip.id, origin: item.trip.origin, destination: item.trip.destination }
            : null,
    };
}

export async function fetchExpenses(): Promise<ExpenseItem[]> {
    const { data } = await axios.get<ExpenseResponse[]>(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.EXPENSES}`);
    return data.map(normalizeExpense);
}

export async function fetchExpensesByFilters(params: {
    vehicleId?: number;
    dateFrom?: string;
    dateTo?: string;
}): Promise<ExpenseItem[]> {
    const query = new URLSearchParams({ limit: '500', page: '1' });
    if (params.vehicleId) query.set('vehicleId', String(params.vehicleId));
    if (params.dateFrom) query.set('dateFrom', params.dateFrom);
    if (params.dateTo) query.set('dateTo', params.dateTo);

    const { data } = await axios.get<{ data: ExpenseResponse[] }>(
        `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.EXPENSES}?${query.toString()}`,
    );
    return (data.data ?? []).map(normalizeExpense);
}

export async function fetchPendingExpensesCount(): Promise<number> {
    const pendingExpenses = await fetchPendingExpenses();
    return pendingExpenses.length;
}

export async function fetchPendingExpenses(): Promise<ExpenseItem[]> {
    const { data } = await axios.get<ExpenseResponse[]>(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.EXPENSES}/pending`);
    return data.map(normalizeExpense);
}

export async function fetchPendingExpenseVehiclePlates(): Promise<string[]> {
    const { data } = await axios.get<ExpenseResponse[]>(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.EXPENSES_PENDING}`);

    const uniquePlates = new Set<string>();
    data.forEach((expense) => {
        const plate = expense.vehicle?.licensePlate?.trim();
        if (plate) {
            uniquePlates.add(plate.toUpperCase());
        }
    });

    return Array.from(uniquePlates).sort((a, b) => a.localeCompare(b));
}

export async function updateExpenseStatus(
    id: number,
    payload: { status: ExpenseStatus; rejectionReason?: string | null; validatedById?: number },
): Promise<ExpenseItem> {
    const { data } = await axios.patch<ExpenseResponse>(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.EXPENSES}/${id}`, {
        ...payload,
        validatedAt: new Date().toISOString(),
    });

    return normalizeExpense(data);
}

export async function fetchDriverLiquidation(
    driverId: number,
    dateFrom: string,
    dateTo: string,
): Promise<DriverLiquidationResponse> {
    const { data } = await axios.get<DriverLiquidationResponse>(
        `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.EXPENSES_DRIVER_LIQUIDATION(driverId)}`,
        {
            params: {
                dateFrom,
                dateTo,
            },
        },
    );

    return {
        ...data,
        totalExpenses: Number(data.totalExpenses ?? 0),
        totalByVehicle: (data.totalByVehicle ?? []).map((item) => ({
            ...item,
            totalExpenses: Number(item.totalExpenses ?? 0),
        })),
    };
}
