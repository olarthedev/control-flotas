export class CreateVehicleDto {
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  vin?: string;
  type: string;
  driverId?: number;
  soatExpiryDate?: Date;
  technicalReviewExpiryDate?: Date;
  insuranceExpiryDate?: Date;
  licenseExpiryDate?: Date;
  maintenanceBudget?: number;
  currentMileage?: number;
}
