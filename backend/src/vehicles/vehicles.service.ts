import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Trip } from '../trips/trip.entity';
import { Expense } from '../expenses/expense.entity';
import { MaintenanceRecord } from '../maintenance/maintenance-record.entity';
import { Consignment } from '../consignments/consignment.entity';

export interface VehicleListSummaryItem {
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

interface VehicleListSummaryRawRow {
  id: string;
  licensePlate: string;
  brand: string;
  model: string;
  type: string;
  soatExpiryDate: Date | null;
  technicalReviewExpiryDate: Date | null;
  totalExpense: string;
  lastMaintenanceDate: Date | null;
}

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,
    @InjectRepository(Trip)
    private tripsRepository: Repository<Trip>,
    @InjectRepository(Expense)
    private expensesRepository: Repository<Expense>,
    @InjectRepository(MaintenanceRecord)
    private maintenanceRepository: Repository<MaintenanceRecord>,
    @InjectRepository(Consignment)
    private consignmentRepository: Repository<Consignment>,
  ) { }

  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const vehicle = this.vehiclesRepository.create(createVehicleDto);
    return await this.vehiclesRepository.save(vehicle);
  }

  async findAll(): Promise<Vehicle[]> {
    return await this.vehiclesRepository.find({
      relations: ['expenses', 'maintenanceRecords', 'trips'],
    });
  }

  async findById(id: number): Promise<Vehicle | null> {
    return await this.vehiclesRepository.findOne({
      where: { id },
      relations: ['expenses', 'maintenanceRecords', 'trips'],
    });
  }

  async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    return await this.vehiclesRepository.findOne({
      where: { licensePlate },
      relations: ['expenses', 'maintenanceRecords', 'trips'],
    });
  }

  async getVehicleListSummaries(): Promise<VehicleListSummaryItem[]> {
    const rows = await this.vehiclesRepository.query<VehicleListSummaryRawRow[]>(
      `SELECT
          v.id,
          v.license_plate                                          AS "licensePlate",
          v.brand,
          v.model,
          v.type,
          v.soat_expiry_date                                       AS "soatExpiryDate",
          v.technical_review_expiry_date                           AS "technicalReviewExpiryDate",
          COALESCE(SUM(e.amount), 0) + v.maintenance_spent         AS "totalExpense",
          MAX(mr.maintenance_date)                                 AS "lastMaintenanceDate"
      FROM vehicles v
      LEFT JOIN expenses e ON e.vehicle_id = v.id
      LEFT JOIN maintenance_records mr ON mr.vehicle_id = v.id
      GROUP BY v.id, v.license_plate, v.brand, v.model, v.type,
               v.soat_expiry_date, v.technical_review_expiry_date, v.maintenance_spent
      ORDER BY v.license_plate ASC`,
    );

    return rows.map((row) => ({
      id: Number(row.id),
      licensePlate: row.licensePlate,
      brand: row.brand,
      model: row.model,
      type: row.type,
      soatExpiryDate: row.soatExpiryDate ? new Date(row.soatExpiryDate).toISOString() : null,
      technicalReviewExpiryDate: row.technicalReviewExpiryDate
        ? new Date(row.technicalReviewExpiryDate).toISOString()
        : null,
      totalExpense: Number(row.totalExpense),
      lastMaintenanceDate: row.lastMaintenanceDate
        ? new Date(row.lastMaintenanceDate).toISOString()
        : null,
    }));
  }

  private static readonly DOCUMENT_EXPIRY_WARNING_DAYS = 30;

  async findVehiclesWithExpiringDocuments(): Promise<Vehicle[]> {
    const warningThreshold = new Date();
    warningThreshold.setDate(warningThreshold.getDate() + VehiclesService.DOCUMENT_EXPIRY_WARNING_DAYS);

    return this.vehiclesRepository
      .createQueryBuilder('vehicle')
      .where('vehicle.soatExpiryDate <= :threshold', { threshold: warningThreshold })
      .orWhere('vehicle.technicalReviewExpiryDate <= :threshold', { threshold: warningThreshold })
      .orWhere('vehicle.insuranceExpiryDate <= :threshold', { threshold: warningThreshold })
      .getMany();
  }

  async update(id: number, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException('Vehicle not found');
    }
    await this.vehiclesRepository.update(id, updateVehicleDto);
    return this.findById(id) as Promise<Vehicle>;
  }

  async remove(id: number) {
    const vehicle = await this.findById(id);
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    await this.expensesRepository.delete({ vehicle: { id } });

    const trips = vehicle.trips ?? [];
    if (trips.length > 0) {
      await this.consignmentRepository.delete({ trip: { id: In(trips.map((trip) => trip.id)) } });
    }

    await this.tripsRepository.delete({ vehicle: { id } });
    await this.maintenanceRepository.delete({ vehicle: { id } });

    return this.vehiclesRepository.delete(id);
  }

}
