import axios from 'axios';
import { apiConfig } from '../config/api';
import { formatCurrency } from '../utils/format';

interface VehicleListSummary {
    id: number;
    licensePlate: string;
    brand: string;
    model: string;
    type: string;
    soatExpiryDate: string | null;
    technicalReviewExpiryDate: string | null;
    totalExpense: number;
    lastMaintenanceDate: string | null;
}

export interface Vehicle {
    id: number;
    licensePlate: string;
    brand: string;
    model: string;
    type: string;
    soatExpiryDate: string | null;
    technicalReviewExpiryDate: string | null;
    insuranceExpiryDate: string | null;
}

export interface VehicleCardData {
    id: number;
    name: string;
    plate: string;
    type: string;
    totalExpense: string;
    lastMaintenance: string;
    soatStatus: string;
    tecnoStatus: string;
}

export interface CreateVehicleDto {
    licensePlate: string;
    brand: string;
    model: string;
    type: string;
    soatExpiryDate?: string | Date;
    technicalReviewExpiryDate?: string | Date;
    insuranceExpiryDate?: string | Date;
    documentNotes?: string;
}

export interface UpdateVehicleDto extends Partial<CreateVehicleDto> { }

function isDateExpired(dateString: string | null): boolean {
    if (!dateString) return false;
    const expiryDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    return expiryDate < today;
}

function formatMaintenanceDate(isoDate: string | null): string {
    if (!isoDate) return 'N/A';
    return new Date(isoDate).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
}

export async function fetchVehicles(): Promise<VehicleCardData[]> {
    const { data } = await axios.get<VehicleListSummary[]>(
        `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.VEHICLES_SUMMARY}`,
    );

    return data.map((vehicle) => ({
        id: vehicle.id,
        name: `${vehicle.brand} ${vehicle.model}`,
        plate: vehicle.licensePlate,
        type: vehicle.type,
        totalExpense: formatCurrency(vehicle.totalExpense),
        lastMaintenance: formatMaintenanceDate(vehicle.lastMaintenanceDate),
        soatStatus: isDateExpired(vehicle.soatExpiryDate) ? 'Vencido' : 'Vigente',
        tecnoStatus: isDateExpired(vehicle.technicalReviewExpiryDate) ? 'Vencido' : 'Vigente',
    }));
}

export async function createVehicle(vehicleData: CreateVehicleDto): Promise<Vehicle> {
    const { data } = await axios.post<Vehicle>(
        `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.VEHICLES}`,
        vehicleData,
    );
    return data;
}

export async function updateVehicle(id: number, vehicleData: UpdateVehicleDto): Promise<Vehicle> {
    const { data } = await axios.patch<Vehicle>(
        `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.VEHICLES_BY_ID(id)}`,
        vehicleData,
    );
    return data;
}

export async function getVehicleById(id: number): Promise<Vehicle> {
    const { data } = await axios.get<Vehicle>(
        `${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.VEHICLES_BY_ID(id)}`,
    );
    return data;
}

export async function deleteVehicle(id: number): Promise<void> {
    await axios.delete(`${apiConfig.BASE_URL}${apiConfig.ENDPOINTS.VEHICLES_BY_ID(id)}`);
}
