import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from './trip.entity';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { User } from '../users/user.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { Expense } from '../expenses/expense.entity';
import { Consignment } from '../consignments/consignment.entity';

@Injectable()
export class TripsService {
    constructor(
        @InjectRepository(Trip)
        private tripsRepository: Repository<Trip>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Vehicle)
        private vehiclesRepository: Repository<Vehicle>,
        @InjectRepository(Expense)
        private expenseRepository: Repository<Expense>,
        @InjectRepository(Consignment)
        private consignmentRepository: Repository<Consignment>,
    ) { }

    /** Create a new trip and resolve related entities. */
    async create(createTripDto: CreateTripDto): Promise<Trip> {
        const trip = new Trip();
        trip.tripNumber = createTripDto.tripNumber;
        trip.startDate = new Date(createTripDto.startDate);
        trip.origin = createTripDto.origin ?? null;
        trip.destination = createTripDto.destination ?? null;
        trip.description = createTripDto.description ?? null;
        trip.plannedBudget = createTripDto.plannedBudget ?? 0;
        trip.status = 'IN_PROGRESS';

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

    /** Return all trips with related data. */
    async findAll(): Promise<Trip[]> {
        return await this.tripsRepository.find({
            relations: ['driver', 'vehicle', 'expenses', 'consignments'],
        });
    }

    /** Find a trip by ID. */
    async findById(id: number): Promise<Trip | null> {
        return await this.tripsRepository.findOne({
            where: { id },
            relations: ['driver', 'vehicle', 'expenses', 'consignments'],
        });
    }

    /** Trips driven by a particular driver. */
    async findByDriver(driverId: number): Promise<Trip[]> {
        return await this.tripsRepository.find({
            where: { driver: { id: driverId } },
            relations: ['driver', 'vehicle', 'expenses', 'consignments'],
            order: { startDate: 'DESC' },
        });
    }

    /** Trips associated with a specific vehicle. */
    async findByVehicle(vehicleId: number): Promise<Trip[]> {
        return await this.tripsRepository.find({
            where: { vehicle: { id: vehicleId } },
            relations: ['driver', 'vehicle', 'expenses', 'consignments'],
            order: { startDate: 'DESC' },
        });
    }

    /** Only trips that are still in progress. */
    async findInProgress(): Promise<Trip[]> {
        return await this.tripsRepository.find({
            where: { status: 'IN_PROGRESS' },
            relations: ['driver', 'vehicle', 'expenses', 'consignments'],
        });
    }

    /** Update trip data; throws if not found. */
    async update(id: number, updateTripDto: UpdateTripDto): Promise<Trip> {
        const existing = await this.findById(id);
        if (!existing) {
            throw new (require('@nestjs/common').NotFoundException)('Trip not found');
        }
        await this.tripsRepository.update(id, updateTripDto);
        return this.findById(id) as Promise<Trip>;
    }

    /** Delete a trip by id. */
    async remove(id: number) {
        const result = await this.tripsRepository.delete(id);
        if (result.affected === 0) {
            throw new (require('@nestjs/common').NotFoundException)('Trip not found');
        }
        return result;
    }

    /** Complete a trip calculating expenses/consignments totals. */
    async completeTrip(id: number): Promise<Trip> {
        const trip = await this.findById(id);
        if (!trip) {
            throw new (require('@nestjs/common').NotFoundException)('Trip not found');
        }

        // Calcular total de gastos
        const expenses = await this.expenseRepository.find({
            where: { trip: { id } },
        });

        const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
        const consignments = await this.consignmentRepository.find({
            where: { trip: { id } },
        });

        const totalConsigned = consignments.reduce((sum, cons) => sum + Number(cons.amount), 0);

        return await this.update(id, {
            status: 'COMPLETED',
            endDate: new Date(),
            totalExpenses: totalExpenses,
            totalConsigned: totalConsigned,
            difference: totalConsigned - totalExpenses,
        } as any);
    }
}
