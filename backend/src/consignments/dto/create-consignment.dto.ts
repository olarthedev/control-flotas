export class CreateConsignmentDto {
    consignmentNumber: string;
    amount: number;
    consignmentDate: Date;
    driverId: number;
    vehicleId?: number;
    tripId?: number;
    consignmentNotes?: string;
}
