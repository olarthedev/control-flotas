export class CreateTripDto {
  tripNumber: string;
  startDate: Date;
  origin?: string;
  destination?: string;
  description?: string;
  driverId: number;
  vehicleId: number;
  plannedBudget?: number;
}
