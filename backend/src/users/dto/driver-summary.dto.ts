export interface DriverSummaryDto {
    id: number;
    fullName: string;
    email: string;
    assignedVehiclePlate: string | null;
    isActive: boolean;
}
