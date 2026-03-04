import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

export interface DriverPayment {
    id: number;
    consignmentNumber: string;
    amount: number;
    consignmentDate: string;
}

interface ResetMonthResponse {
    updated: number;
}

interface DriverPaymentResponse {
    id: number;
    consignmentNumber: string;
    amount: string | number;
    consignmentDate: string;
}

function buildPaymentNumber(): string {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `ABONO-${suffix}`;
}

export async function createDriverPayment(driverId: number, amount: number): Promise<DriverPayment> {
    const payload = {
        consignmentNumber: buildPaymentNumber(),
        amount,
        consignmentDate: new Date().toISOString(),
        driverId,
        consignmentNotes: 'Abono de salario generado desde módulo de conductores',
    };

    const { data } = await axios.post<DriverPaymentResponse>(`${API_BASE_URL}/consignments`, payload);

    return {
        id: data.id,
        consignmentNumber: data.consignmentNumber,
        amount: Number(data.amount ?? 0),
        consignmentDate: data.consignmentDate,
    };
}

export async function fetchDriverPaymentHistory(driverId: number): Promise<DriverPayment[]> {
    const { data } = await axios.get<DriverPaymentResponse[]>(`${API_BASE_URL}/consignments/driver/${driverId}`);

    return data.map((item) => ({
        id: item.id,
        consignmentNumber: item.consignmentNumber,
        amount: Number(item.amount ?? 0),
        consignmentDate: item.consignmentDate,
    }));
}

export async function resetDriverPaymentMonth(driverId: number): Promise<number> {
    const { data } = await axios.patch<ResetMonthResponse>(`${API_BASE_URL}/consignments/driver/${driverId}/reset-month`);
    return Number(data.updated ?? 0);
}
