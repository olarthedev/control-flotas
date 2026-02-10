export class CreateMaintenanceDto {
  type: string;
  title: string;
  description: string;
  maintenanceDate: Date;
  cost: number;
  vehicleId: number;
  invoiceNumber?: string;
  provider?: string;
  mileageAtMaintenance?: number;
  nextMaintenanceMileage?: number;
  nextMaintenanceDate?: Date;
  technicalNotes?: string;
}
