import axios from 'axios';
import { apiConfig } from '../config/api';

export type ConsignmentStatus = 'ACTIVE' | 'CLOSED' | 'DISPUTED';

export interface DriverPayment {
    id: number;
    consignmentNumber: string;
    amount: number;
    consignmentDate: string;
}

export interface ConsignmentItem {
    id: number;
    consignmentNumber: string;
    amount: number;
    consignmentDate: string;
    status: ConsignmentStatus;
    driver: {
        id: number;
        fullName: string;
    } | null;
    vehicle: {
        id: number;
        licensePlate: string;
    } | null;
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

interface ConsignmentResponse {
    id: number;
    consignmentNumber: string;
    amount: string | number;
    consignmentDate: string;
    status: ConsignmentStatus;
    driver: {
        id: number;
        fullName: string;
    } | null;
    vehicle: {
        id: number;
        licensePlate: string;
    } | null;
}

function buildPaymentNumber(): string {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `ABONO-${suffix}`;
}

function buildConsignmentNumber(): string {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `CONSIG-${suffix}`;
}

export async function createDriverPayment(driverId: number, amount: number): Promise<DriverPayment> {
    const payload = {
        consignmentNumber: buildPaymentNumber(),
        amount,
        consignmentDate: new Date().toISOString(),
        driverId,
        consignmentNotes: 'Abono de salario generado desde módulo de conductores',
    };

    const { data } = await axios.post<DriverPaymentResponse>(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.CONSIGNMENTS}`, payload);

    return {
        id: data.id,
        consignmentNumber: data.consignmentNumber,
        amount: Number(data.amount ?? 0),
        consignmentDate: data.consignmentDate,
    };
}

export async function createConsignment(
    driverId: number,
    vehicleId: number,
    amount: number,
    notes?: string,
    date?: string
): Promise<ConsignmentItem> {
    const payload = {
        consignmentNumber: buildConsignmentNumber(),
        amount,
        consignmentDate: date || new Date().toISOString(),
        driverId,
        vehicleId,
        consignmentNotes: notes || 'Consignación semanal',
    };

    const { data } = await axios.post<ConsignmentResponse>(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.CONSIGNMENTS}`, payload);

    return {
        id: data.id,
        consignmentNumber: data.consignmentNumber,
        amount: Number(data.amount ?? 0),
        consignmentDate: data.consignmentDate,
        status: data.status,
        driver: data.driver,
        vehicle: data.vehicle,
    };
}

export async function fetchDriverPaymentHistory(driverId: number): Promise<DriverPayment[]> {
    const { data } = await axios.get<DriverPaymentResponse[]>(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.DRIVERS_PAYMENTS(driverId)}`);

    return data.map((item) => ({
        id: item.id,
        consignmentNumber: item.consignmentNumber,
        amount: Number(item.amount ?? 0),
        consignmentDate: item.consignmentDate,
    }));
}

export async function fetchAllConsignments(): Promise<ConsignmentItem[]> {
    const { data } = await axios.get<ConsignmentResponse[]>(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.CONSIGNMENTS}`);

    return data.map((item) => ({
        id: item.id,
        consignmentNumber: item.consignmentNumber,
        amount: Number(item.amount ?? 0),
        consignmentDate: item.consignmentDate,
        status: item.status,
        driver: item.driver,
        vehicle: item.vehicle,
    }));
}

export async function resetDriverPaymentMonth(driverId: number): Promise<number> {
    const { data } = await axios.patch<ResetMonthResponse>(`${apiConfig.BASE_URL}/consignments/driver/${driverId}/reset-month`);
    return Number(data.updated ?? 0);
}
