import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001';

export interface Vehicle {
    id: number;
    licensePlate: string;
    brand: string;
    model: string;
    type: string;
    soatExpiryDate: string | null;
    technicalReviewExpiryDate: string | null;
    maintenanceSpent: number;
    maintenanceRecords: { createdAt: string }[];
    expenses: { amount: number }[];
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

function isDateExpired(dateString: string | null): boolean {
    if (!dateString) return false;
    const expiryDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);
    return expiryDate < today;
}

function formatDate(dateString: string | null): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', { year: 'numeric', month: '2-digit', day: '2-digit' });
}

function calculateTotalExpense(vehicle: Vehicle): number {
    const maintenanceSpent = vehicle.maintenanceSpent || 0;
    const expensesTotal = vehicle.expenses?.reduce((sum, expense) => sum + (expense.amount || 0), 0) || 0;
    return maintenanceSpent + expensesTotal;
}

function getLastMaintenanceDate(vehicle: Vehicle): string {
    if (!vehicle.maintenanceRecords || vehicle.maintenanceRecords.length === 0) {
        return 'N/A';
    }
    const sortedRecords = [...vehicle.maintenanceRecords].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return formatDate(sortedRecords[0].createdAt);
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

export async function fetchVehicles(): Promise<VehicleCardData[]> {
    try {
        const { data } = await axios.get<Vehicle[]>(`${API_BASE_URL}/vehicles`);

        return data.map(vehicle => ({
            id: vehicle.id,
            name: `${vehicle.brand} ${vehicle.model}`,
            plate: vehicle.licensePlate,
            type: vehicle.type,
            totalExpense: `$${calculateTotalExpense(vehicle).toLocaleString('es-CO')}`,
            lastMaintenance: getLastMaintenanceDate(vehicle),
            soatStatus: isDateExpired(vehicle.soatExpiryDate) ? 'Vencido' : 'Vigente',
            tecnoStatus: isDateExpired(vehicle.technicalReviewExpiryDate) ? 'Vencido' : 'Vigente',
        }));
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        throw error;
    }
}

export async function createVehicle(vehicleData: CreateVehicleDto): Promise<Vehicle> {
    try {
        const { data } = await axios.post<Vehicle>(`${API_BASE_URL}/vehicles`, vehicleData);
        return data;
    } catch (error) {
        console.error('Error creating vehicle:', error);
        throw error;
    }
}

export async function updateVehicle(id: number, vehicleData: UpdateVehicleDto): Promise<Vehicle> {
    try {
        const { data } = await axios.patch<Vehicle>(`${API_BASE_URL}/vehicles/${id}`, vehicleData);
        return data;
    } catch (error) {
        console.error('Error updating vehicle:', error);
        throw error;
    }
}

export async function getVehicleById(id: number): Promise<Vehicle> {
    try {
        const { data } = await axios.get<Vehicle>(`${API_BASE_URL}/vehicles/${id}`);
        return data;
    } catch (error) {
        console.error('Error fetching vehicle:', error);
        throw error;
    }
}

export async function deleteVehicle(id: number): Promise<void> {
    try {
        await axios.delete(`${API_BASE_URL}/vehicles/${id}`);
    } catch (error) {
        console.error('Error deleting vehicle:', error);
        throw error;
    }
}
