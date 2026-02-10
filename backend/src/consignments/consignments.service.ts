import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consignment } from './consignment.entity';
import { CreateConsignmentDto } from './dto/create-consignment.dto';
import { UpdateConsignmentDto } from './dto/update-consignment.dto';
import { User } from '../users/user.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { Trip } from '../trips/trip.entity';

@Injectable()
export class ConsignmentsService {
  constructor(
    @InjectRepository(Consignment)
    private consignmentsRepository: Repository<Consignment>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Vehicle)
    private vehiclesRepository: Repository<Vehicle>,
    @InjectRepository(Trip)
    private tripsRepository: Repository<Trip>,
  ) {}

  async create(createConsignmentDto: CreateConsignmentDto) {
    const consignment = new Consignment();
    consignment.consignmentNumber = createConsignmentDto.consignmentNumber;
    consignment.amount = createConsignmentDto.amount;
    consignment.consignmentDate = new Date(createConsignmentDto.consignmentDate);
    consignment.consignmentNotes = createConsignmentDto.consignmentNotes ?? null;

    if (createConsignmentDto.driverId) {
      const driver = await this.usersRepository.findOne({ where: { id: createConsignmentDto.driverId } });
      if (driver) consignment.driver = driver;
    }
    if (createConsignmentDto.vehicleId) {
      const vehicle = await this.vehiclesRepository.findOne({ where: { id: createConsignmentDto.vehicleId } });
      if (vehicle) consignment.vehicle = vehicle;
    }
    if (createConsignmentDto.tripId) {
      const trip = await this.tripsRepository.findOne({ where: { id: createConsignmentDto.tripId } });
      if (trip) consignment.trip = trip;
    }

    return await this.consignmentsRepository.save(consignment);
  }

  async findAll() {
    return await this.consignmentsRepository.find({
      relations: ['driver', 'vehicle', 'trip', 'expenses'],
    });
  }

  async findById(id: number) {
    return await this.consignmentsRepository.findOne({
      where: { id },
      relations: ['driver', 'vehicle', 'trip', 'expenses'],
    });
  }

  async findByDriver(driverId: number) {
    return await this.consignmentsRepository.find({
      where: { driver: { id: driverId } },
      relations: ['driver', 'vehicle', 'trip', 'expenses'],
      order: { consignmentDate: 'DESC' },
    });
  }

  async findActive() {
    return await this.consignmentsRepository.find({
      where: { status: 'ACTIVE' as any },
      relations: ['driver', 'vehicle', 'trip', 'expenses'],
    });
  }

  async update(id: number, updateConsignmentDto: UpdateConsignmentDto) {
    await this.consignmentsRepository.update(id, updateConsignmentDto as any);
    return this.findById(id);
  }

  async remove(id: number) {
    return await this.consignmentsRepository.delete(id);
  }

  async closeConsignment(id: number) {
    return await this.update(id, {
      status: 'CLOSED',
      closingDate: new Date(),
    });
  }
}
