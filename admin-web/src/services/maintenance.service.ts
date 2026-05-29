import axios from 'axios';
import { apiConfig } from '../config/api';

export type MaintenanceType = 'preventive' | 'corrective' | 'emergency';
export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface MaintenanceVehicle {
    id: number;
    licensePlate: string;
    brand: string;
    model: string;
    type: string;
}

export interface MaintenanceRecord {
    id: number;
    type: MaintenanceType;
    title: string;
    maintenanceDate: string;
    cost: number;
    invoiceNumber: string | null;
    provider: string | null;
    mileageAtMaintenance: number | null;
    status: MaintenanceStatus;
    requiresFollowUp: boolean;
    vehicle: MaintenanceVehicle;
    createdAt: string;
    updatedAt: string;
}

interface MaintenanceRecordResponse extends Omit<MaintenanceRecord, 'cost' | 'mileageAtMaintenance'> {
    cost: number | string;
    mileageAtMaintenance: number | string | null;
}

export interface CreateMaintenanceDto {
    type: MaintenanceType;
    title: string;
    maintenanceDate: string;
    cost: number;
    vehicleId: number;
    performedById?: number;
    invoiceNumber?: string;
    provider?: string;
    mileageAtMaintenance?: number;
    requiresFollowUp?: boolean;
}

export interface UpdateMaintenanceDto extends Partial<CreateMaintenanceDto> {
    status?: MaintenanceStatus;
}

function toNullableNumber(value: number | string | null): number | null {
    if (value === null || value === undefined || value === '') {
        return null;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
}

function normalizeMaintenanceRecord(item: MaintenanceRecordResponse): MaintenanceRecord {
    return {
        ...item,
        cost: Number(item.cost ?? 0),
        mileageAtMaintenance: toNullableNumber(item.mileageAtMaintenance),
    };
}

export async function fetchMaintenanceRecords(): Promise<MaintenanceRecord[]> {
    const { data } = await axios.get<MaintenanceRecordResponse[]>(
        `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.MAINTENANCE}`,
    );

    return data.map(normalizeMaintenanceRecord);
}

export async function createMaintenanceRecord(payload: CreateMaintenanceDto): Promise<MaintenanceRecord> {
    const { data } = await axios.post<MaintenanceRecordResponse>(
        `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.MAINTENANCE}`,
        payload,
    );

    return normalizeMaintenanceRecord(data);
}

export async function updateMaintenanceRecord(id: number, payload: UpdateMaintenanceDto): Promise<MaintenanceRecord> {
    const { data } = await axios.patch<MaintenanceRecordResponse>(
        `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.MAINTENANCE_BY_ID(id)}`,
        payload,
    );

    return normalizeMaintenanceRecord(data);
}

export async function completeMaintenanceRecord(id: number): Promise<MaintenanceRecord> {
    const { data } = await axios.patch<MaintenanceRecordResponse>(
        `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.MAINTENANCE_COMPLETE(id)}`,
        {},
    );

    return normalizeMaintenanceRecord(data);
}

export async function deleteMaintenanceRecord(id: number): Promise<void> {
    await axios.delete(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.MAINTENANCE_BY_ID(id)}`);
}
