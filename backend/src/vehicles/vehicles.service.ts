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

  /**
   * Create a new vehicle record.
   * @param createVehicleDto Data for the new vehicle
   */
  async create(createVehicleDto: CreateVehicleDto): Promise<Vehicle> {
    const vehicle = this.vehiclesRepository.create(createVehicleDto);
    return await this.vehiclesRepository.save(vehicle);
  }

  /**
   * Return all vehicles, including related entities.
   */
  async findAll(): Promise<Vehicle[]> {
    return await this.vehiclesRepository.find({
      relations: ['expenses', 'maintenanceRecords', 'trips'],
    });
  }

  /**
   * Find a single vehicle by its id.
   */
  async findById(id: number): Promise<Vehicle | null> {
    return await this.vehiclesRepository.findOne({
      where: { id },
      relations: ['expenses', 'maintenanceRecords', 'trips'],
    });
  }

  /**
   * Look up a vehicle by license plate string.
   */
  async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    return await this.vehiclesRepository.findOne({
      where: { licensePlate },
      relations: ['expenses', 'maintenanceRecords', 'trips'],
    });
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

  /**
   * Update an existing vehicle; throws if not found.
   */
  async update(id: number, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new NotFoundException('Vehicle not found');
    }
    await this.vehiclesRepository.update(id, updateVehicleDto);
    return this.findById(id) as Promise<Vehicle>;
  }

  /**
   * Delete a vehicle by id with proper cascading of related records.
   */
  async remove(id: number) {
    const vehicle = await this.findById(id);
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    // Delete in reverse dependency order:
    // 1. Delete expenses (Evidence cascades via expense)
    // 2. Delete consignments (may reference expenses/trips)
    // 3. Delete trips (may have related expenses not yet deleted)
    // 4. Delete maintenance records
    // 5. Delete vehicle

    // Delete all expenses for this vehicle (including those via trips)
    await this.expensesRepository.delete({ vehicle: { id } });

    const trips = vehicle.trips ?? [];
    if (trips.length > 0) {
      await this.consignmentRepository.delete({ trip: { id: In(trips.map((trip) => trip.id)) } });
    }

    // Delete trips for this vehicle
    await this.tripsRepository.delete({ vehicle: { id } });

    // Delete maintenance records
    await this.maintenanceRepository.delete({ vehicle: { id } });

    // Finally delete the vehicle
    const result = await this.vehiclesRepository.delete(id);
    return result;
  }

}
