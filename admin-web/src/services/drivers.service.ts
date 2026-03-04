import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

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
    assignedVehicleId?: number;
}

export async function fetchDriverSummaries(): Promise<DriverSummary[]> {
    const { data } = await axios.get<DriverSummary[]>(`${API_BASE_URL}/users/drivers/summary`);
    return data;
}

export async function createDriver(payload: CreateDriverDto): Promise<void> {
    await axios.post(`${API_BASE_URL}/users`, payload);
}

export async function getDriverById(id: number): Promise<DriverDetail> {
    const { data } = await axios.get<DriverDetail>(`${API_BASE_URL}/users/${id}`);
    return data;
}

export async function updateDriver(id: number, payload: UpdateDriverDto): Promise<void> {
    await axios.patch(`${API_BASE_URL}/users/${id}`, payload);
}

export async function deleteDriver(id: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/users/${id}`);
}
