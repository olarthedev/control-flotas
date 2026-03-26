import axios from 'axios';
import { apiConfig } from '../config/api';

export interface DriverSummary {
    id: number;
    fullName: string;
    email: string;
    monthlySalary: number;
    pendingBalance: number;
    assignedVehiclePlate: string | null;
    isActive: boolean;
}

export interface DriverDetail {
    id: number;
    fullName: string;
    email: string;
    phone?: string;
    licenseNumber?: string;
    monthlySalary?: number;
    role: 'DRIVER' | 'ADMIN';
    isActive: boolean;
    assignedVehicle?: {
        id: number;
        licensePlate: string;
        brand: string;
        model: string;
    } | null;
}

export interface CreateDriverDto {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    licenseNumber?: string;
    monthlySalary?: number;
    role: 'DRIVER';
    isActive?: boolean;
    assignedVehicleId?: number;
}

export interface UpdateDriverDto {
    fullName?: string;
    email?: string;
    password?: string;
    phone?: string;
    licenseNumber?: string;
    monthlySalary?: number;
    isActive?: boolean;
    assignedVehicleId?: number | null;
    assignmentChangeReason?: string;
    assignmentEffectiveAt?: string;
}

export interface VehicleAssignmentHistoryItem {
    vehicleId: number;
    vehiclePlate: string;
    startDate: string;
    endDate: string | null;
    reason?: string;
    changedBy?: string;
}

export interface DriverVehicleAssignmentHistory {
    driverId: number;
    driverName: string;
    currentVehicleId: number | null;
    currentVehiclePlate: string | null;
    history: VehicleAssignmentHistoryItem[];
}

export interface AssignDriverVehicleDto {
    assignedVehicleId: number | null;
    assignmentChangeReason: string;
    assignmentEffectiveAt?: string;
    changedBy?: string;
}

type NumericLike = number | string | null | undefined;

function toNumber(value: NumericLike): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

export async function fetchDriverSummaries(): Promise<DriverSummary[]> {
    const { data } = await axios.get<DriverSummary[]>(`${apiConfig.BASE_URL}/users/drivers/summary`);
    return data.map((driver) => ({
        ...driver,
        monthlySalary: toNumber(driver.monthlySalary),
        pendingBalance: toNumber(driver.pendingBalance),
    }));
}

export async function createDriver(payload: CreateDriverDto): Promise<void> {
    await axios.post(`${apiConfig.BASE_URL}/users`, payload);
}

export async function getDriverById(id: number): Promise<DriverDetail> {
    const { data } = await axios.get<DriverDetail>(`${apiConfig.BASE_URL}/users/${id}`);
    return {
        ...data,
        monthlySalary: data.monthlySalary != null ? toNumber(data.monthlySalary) : undefined,
    };
}

export async function updateDriver(id: number, payload: UpdateDriverDto): Promise<void> {
    await axios.patch(`${apiConfig.BASE_URL}/users/${id}`, payload);
}

export async function fetchDriverVehicleAssignmentHistory(id: number): Promise<DriverVehicleAssignmentHistory> {
    const { data } = await axios.get<DriverVehicleAssignmentHistory>(
        `${apiConfig.BASE_URL}/users/${id}/vehicle-assignment-history`,
    );

    return data;
}

export async function assignDriverVehicle(id: number, payload: AssignDriverVehicleDto): Promise<void> {
    await axios.patch(`${apiConfig.BASE_URL}/users/${id}/assign-vehicle`, payload);
}

export async function deleteDriver(id: number): Promise<void> {
    await axios.delete(`${apiConfig.BASE_URL}/users/${id}`);
}
