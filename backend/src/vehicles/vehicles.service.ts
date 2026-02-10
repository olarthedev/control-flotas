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

  async create(createVehicleDto: CreateVehicleDto) {
    const vehicle = this.vehiclesRepository.create(createVehicleDto);
    return await this.vehiclesRepository.save(vehicle);
  }

  async findAll() {
    return await this.vehiclesRepository.find({
      relations: ['driver', 'expenses', 'maintenanceRecords', 'trips'],
    });
  }

  async findById(id: number) {
    return await this.vehiclesRepository.findOne({
      where: { id },
      relations: ['driver', 'expenses', 'maintenanceRecords', 'trips'],
    });
  }

  async findByLicensePlate(licensePlate: string) {
    return await this.vehiclesRepository.findOne({
      where: { licensePlate },
      relations: ['driver', 'expenses', 'maintenanceRecords', 'trips'],
    });
  }

  async findActive() {
    return await this.vehiclesRepository.find({
      where: { isActive: true },
      relations: ['driver', 'expenses', 'maintenanceRecords', 'trips'],
    });
  }

  async findWithExpiredDocuments() {
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

  async update(id: number, updateVehicleDto: UpdateVehicleDto) {
    await this.vehiclesRepository.update(id, updateVehicleDto);
    return this.findById(id);
  }

  async remove(id: number) {
    return await this.vehiclesRepository.delete(id);
  }

  async toggleActive(id: number) {
    const vehicle = await this.findById(id);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }
    vehicle.isActive = !vehicle.isActive;
    return await this.vehiclesRepository.save(vehicle);
  }
}
