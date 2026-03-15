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
    try {
        const pendingExpenses = await fetchPendingExpenses();
        return pendingExpenses.length;
    } catch (error) {
        console.error('Error fetching pending expenses count:', error);
        return 0;
    }
}

export async function fetchPendingExpenses(): Promise<ExpenseItem[]> {
    try {
        const { data } = await axios.get<ExpenseResponse[]>(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.EXPENSES}/pending`);
        return data.map(normalizeExpense);
    } catch (error) {
        console.error('Error fetching pending expenses:', error);
        return [];
    }
}

export async function fetchPendingExpenseVehiclePlates(): Promise<string[]> {
    try {
        const { data } = await axios.get<ExpenseResponse[]>(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.EXPENSES_PENDING}`);

        const uniquePlates = new Set<string>();
        data.forEach((expense) => {
            const plate = expense.vehicle?.licensePlate?.trim();
            if (plate) {
                uniquePlates.add(plate.toUpperCase());
            }
        });

        return Array.from(uniquePlates).sort((a, b) => a.localeCompare(b));
    } catch (error) {
        console.error('Error fetching pending expense vehicles:', error);
        return [];
    }
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
