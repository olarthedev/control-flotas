import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

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

function normalizeExpense(item: ExpenseResponse): ExpenseItem {
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
    const { data } = await axios.get<ExpenseResponse[]>(`${API_BASE_URL}/expenses`);
    return data.map(normalizeExpense);
}

export async function updateExpenseStatus(
    id: number,
    payload: { status: ExpenseStatus; rejectionReason?: string | null; validatedBy?: string },
): Promise<ExpenseItem> {
    const { data } = await axios.patch<ExpenseResponse>(`${API_BASE_URL}/expenses/${id}`, {
        ...payload,
        validatedAt: new Date().toISOString(),
    });

    return normalizeExpense(data);
}
