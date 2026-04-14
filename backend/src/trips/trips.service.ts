import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip, TripStatus } from './trip.entity';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { User } from '../users/user.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { Expense } from '../expenses/expense.entity';
import { Consignment } from '../consignments/consignment.entity';
import { UsersService } from '../users/users.service';

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
        private readonly usersService: UsersService,
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
        trip.status = TripStatus.IN_PROGRESS;

        // resolve relations
        const driver = await this.usersRepository.findOne({
            where: { id: createTripDto.driverId },
            relations: ['assignedVehicle'],
        });
        if (!driver) {
            throw new NotFoundException(`Driver con id ${createTripDto.driverId} no encontrado`);
        }

        const vehicle = await this.vehiclesRepository.findOne({ where: { id: createTripDto.vehicleId } });
        if (!vehicle) {
            throw new NotFoundException(`Vehicle con id ${createTripDto.vehicleId} no encontrado`);
        }

        trip.driver = driver;
        trip.vehicle = vehicle;

        if (driver.assignedVehicle?.id !== vehicle.id) {
            await this.usersService.assignDriverVehicle(driver.id, {
                assignedVehicleId: vehicle.id,
                assignmentChangeReason: `Cambio automático por inicio de ruta ${trip.tripNumber}`,
                assignmentEffectiveAt: new Date(createTripDto.startDate).toISOString(),
                changedBy: 'trip-start',
            });
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
            where: { status: TripStatus.IN_PROGRESS },
            relations: ['driver', 'vehicle', 'expenses', 'consignments'],
        });
    }

    /** Update trip data; throws if not found. */
    async update(id: number, updateTripDto: Partial<Trip> | UpdateTripDto): Promise<Trip> {
        const existing = await this.findById(id);
        if (!existing) {
            throw new NotFoundException('Trip not found');
        }

        const updateData = { ...updateTripDto } as unknown as Partial<Trip>;
        if ('endDate' in updateTripDto && updateTripDto.endDate !== undefined) {
            updateData.endDate = new Date(updateTripDto.endDate as string);
        }
        if ('startDate' in updateTripDto && updateTripDto.startDate !== undefined) {
            updateData.startDate = new Date(updateTripDto.startDate as string);
        }
        if ('status' in updateTripDto && updateTripDto.status !== undefined) {
            updateData.status = updateTripDto.status as TripStatus;
        }

        await this.tripsRepository.update(id, updateData);
        return this.findById(id) as Promise<Trip>;
    }

    /** Delete a trip by id. */
    async remove(id: number) {
        const result = await this.tripsRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('Trip not found');
        }
        return result;
    }

    /** Complete a trip calculating expenses/consignments totals. */
    async completeTrip(id: number): Promise<Trip> {
        const trip = await this.findById(id);
        if (!trip) {
            throw new NotFoundException('Trip not found');
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

        const updateData: Partial<Trip> = {
            status: TripStatus.COMPLETED,
            endDate: new Date(),
            totalExpenses: totalExpenses,
            totalConsigned: totalConsigned,
            difference: totalConsigned - totalExpenses,
        };
        return await this.update(id, updateData);
    }
}
