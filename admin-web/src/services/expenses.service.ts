import axios from 'axios';
import { apiConfig } from '../config/api';

export type ExpenseStatus = 'PENDING' | 'APPROVED' | 'OBSERVED' | 'REJECTED';

export interface ExpenseEvidence {
    id: number;
    fileUrl: string;
    isPrimary: boolean;
}

export interface ExpenseItem {
    id: number;
    type: string;
    amount: number;
    expenseDate: string;
    description: string | null;
    notes: string | null;
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
    type: string;
    amount: number | string;
    expenseDate: string;
    description: string | null;
    notes: string | null;
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
}

export function normalizeExpense(item: ExpenseResponse): ExpenseItem {
    return {
        id: item.id,
        type: item.type,
        amount: Number(item.amount ?? 0),
        expenseDate: item.expenseDate,
        description: item.description,
        notes: item.notes,
        status: item.status,
        rejectionReason: item.rejectionReason,
        driver: item.driver,
        vehicle: item.vehicle,
        evidence: item.evidence ?? [],
    };
}

export async function fetchExpenses(): Promise<ExpenseItem[]> {
    const { data } = await axios.get<ExpenseResponse[]>(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.EXPENSES}`);
    return data.map(normalizeExpense);
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
    payload: { status: ExpenseStatus; rejectionReason?: string | null; validatedBy?: string },
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
