export interface DriverSummaryDto {
    id: number;
    fullName: string;
    email: string;
    monthlySalary: number;
    pendingBalance: number;
    assignedVehiclePlate: string | null;
    isActive: boolean;
}
