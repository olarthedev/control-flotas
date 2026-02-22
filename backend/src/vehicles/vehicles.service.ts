import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './vehicle.entity';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,
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
      relations: ['driver', 'expenses', 'maintenanceRecords', 'trips'],
    });
  }

  /**
   * Find a single vehicle by its id.
   */
  async findById(id: number): Promise<Vehicle | null> {
    return await this.vehiclesRepository.findOne({
      where: { id },
      relations: ['driver', 'expenses', 'maintenanceRecords', 'trips'],
    });
  }

  /**
   * Look up a vehicle by license plate string.
   */
  async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    return await this.vehiclesRepository.findOne({
      where: { licensePlate },
      relations: ['driver', 'expenses', 'maintenanceRecords', 'trips'],
    });
  }

  /**
   * Get only active vehicles.
   */
  async findActive(): Promise<Vehicle[]> {
    return await this.vehiclesRepository.find({
      where: { isActive: true },
      relations: ['driver', 'expenses', 'maintenanceRecords', 'trips'],
    });
  }

  /**
   * Return vehicles with documents expiring within 30 days.
   */
  async findWithExpiredDocuments(): Promise<Vehicle[]> {
    const vehicles = await this.vehiclesRepository.find();
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    return vehicles.filter((v) => {
      return (
        (v.soatExpiryDate && v.soatExpiryDate <= thirtyDaysFromNow) ||
        (v.technicalReviewExpiryDate && v.technicalReviewExpiryDate <= thirtyDaysFromNow) ||
        (v.insuranceExpiryDate && v.insuranceExpiryDate <= thirtyDaysFromNow)
      );
    });
  }

  /**
   * Update an existing vehicle; throws if not found.
   */
  async update(id: number, updateVehicleDto: UpdateVehicleDto): Promise<Vehicle> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new (require('@nestjs/common').NotFoundException)('Vehicle not found');
    }
    await this.vehiclesRepository.update(id, updateVehicleDto);
    return this.findById(id) as Promise<Vehicle>;
  }

  /**
   * Delete a vehicle by id.
   */
  async remove(id: number) {
    const result = await this.vehiclesRepository.delete(id);
    if (result.affected === 0) {
      throw new (require('@nestjs/common').NotFoundException)('Vehicle not found');
    }
    return result;
  }

  /**
   * Toggle the `isActive` flag on a vehicle.
   */
  async toggleActive(id: number) {
    const vehicle = await this.findById(id);
    if (!vehicle) {
      throw new (require('@nestjs/common').NotFoundException)('Vehicle not found');
    }
    vehicle.isActive = !vehicle.isActive;
    return await this.vehiclesRepository.save(vehicle);
  }
}
