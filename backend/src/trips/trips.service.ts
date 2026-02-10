import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from './trip.entity';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { User } from '../users/user.entity';
import { Vehicle } from '../vehicles/vehicle.entity';

@Injectable()
export class TripsService {
    constructor(
        @InjectRepository(Trip)
        private tripsRepository: Repository<Trip>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Vehicle)
        private vehiclesRepository: Repository<Vehicle>,
    ) { }

    async create(createTripDto: CreateTripDto) {
        const trip = new Trip();
        trip.tripNumber = createTripDto.tripNumber;
        trip.startDate = new Date(createTripDto.startDate);
        trip.origin = createTripDto.origin ?? null;
        trip.destination = createTripDto.destination ?? null;
        trip.description = createTripDto.description ?? null;
        trip.plannedBudget = createTripDto.plannedBudget ?? 0;

        // resolve relations
        if (createTripDto.driverId) {
            const driver = await this.usersRepository.findOne({ where: { id: createTripDto.driverId } });
            if (driver) trip.driver = driver;
        }
        if (createTripDto.vehicleId) {
            const vehicle = await this.vehiclesRepository.findOne({ where: { id: createTripDto.vehicleId } });
            if (vehicle) trip.vehicle = vehicle;
        }

        return await this.tripsRepository.save(trip);
    }

    async findAll() {
        return await this.tripsRepository.find({
            relations: ['driver', 'vehicle', 'expenses', 'consignments'],
        });
    }

    async findById(id: number) {
        return await this.tripsRepository.findOne({
            where: { id },
            relations: ['driver', 'vehicle', 'expenses', 'consignments'],
        });
    }

    async findByDriver(driverId: number) {
        return await this.tripsRepository.find({
            where: { driver: { id: driverId } },
            relations: ['driver', 'vehicle', 'expenses', 'consignments'],
            order: { startDate: 'DESC' },
        });
    }

    async findByVehicle(vehicleId: number) {
        return await this.tripsRepository.find({
            where: { vehicle: { id: vehicleId } },
            relations: ['driver', 'vehicle', 'expenses', 'consignments'],
            order: { startDate: 'DESC' },
        });
    }

    async findInProgress() {
        return await this.tripsRepository.find({
            where: { status: 'IN_PROGRESS' },
            relations: ['driver', 'vehicle', 'expenses', 'consignments'],
        });
    }

    async update(id: number, updateTripDto: UpdateTripDto) {
        await this.tripsRepository.update(id, updateTripDto);
        return this.findById(id);
    }

    async remove(id: number) {
        return await this.tripsRepository.delete(id);
    }

    async completeTrip(id: number) {
        return await this.update(id, {
            status: 'COMPLETED',
            endDate: new Date(),
        });
    }
}
