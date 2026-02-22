import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { User } from '../users/user.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { Trip } from '../trips/trip.entity';
import { ExpenseStatus } from './expense.entity';

@Injectable()
export class ExpensesService {
    constructor(
        @InjectRepository(Expense)
        private expensesRepository: Repository<Expense>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Vehicle)
        private vehiclesRepository: Repository<Vehicle>,
        @InjectRepository(Trip)
        private tripsRepository: Repository<Trip>,
    ) { }

    /**
     * Create a new expense record, resolving required relations.
     * Throws NotFoundException if the specified driver does not exist.
     */
    async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
        const expense = new Expense();
        expense.type = createExpenseDto.type;
        expense.amount = createExpenseDto.amount;
        expense.expenseDate = new Date(createExpenseDto.expenseDate);
        expense.description = createExpenseDto.description ?? null;
        expense.notes = createExpenseDto.notes ?? null;

        // Resolver relaciones de forma segura (conductor es obligatorio)
        if (createExpenseDto.driverId) {
            const driver = await this.usersRepository.findOne({
                where: { id: createExpenseDto.driverId }
            });
            if (!driver) {
                throw new (require('@nestjs/common').NotFoundException)(
                    `Driver con id ${createExpenseDto.driverId} no encontrado`,
                );
            }
            expense.driver = driver;
        }

        // Vehículo es opcional
        if (createExpenseDto.vehicleId) {
            const vehicle = await this.vehiclesRepository.findOne({
                where: { id: createExpenseDto.vehicleId }
            });
            if (vehicle) {
                expense.vehicle = vehicle;
            }
        }

        // Viaje es opcional
        if (createExpenseDto.tripId) {
            const trip = await this.tripsRepository.findOne({
                where: { id: createExpenseDto.tripId }
            });
            if (trip) {
                expense.trip = trip;
            }
        }

        return await this.expensesRepository.save(expense);
    }

    /**
     * Retrieve all expenses with full relations.
     */
    async findAll(): Promise<Expense[]> {
        return await this.expensesRepository.find({
            relations: ['driver', 'vehicle', 'trip', 'evidence', 'consignment'],
        });
    }

    /** Find expense by id. */
    async findById(id: number): Promise<Expense | null> {
        return await this.expensesRepository.findOne({
            where: { id },
            relations: ['driver', 'vehicle', 'trip', 'evidence', 'consignment'],
        });
    }

    /** Expenses submitted by a specific driver. */
    async findByDriver(driverId: number): Promise<Expense[]> {
        return await this.expensesRepository.find({
            where: { driver: { id: driverId } },
            relations: ['driver', 'vehicle', 'trip', 'evidence', 'consignment'],
            order: { expenseDate: 'DESC' },
        });
    }

    /** Expenses associated to a trip. */
    async findByTrip(tripId: number): Promise<Expense[]> {
        return await this.expensesRepository.find({
            where: { trip: { id: tripId } },
            relations: ['driver', 'vehicle', 'trip', 'evidence', 'consignment'],
            order: { expenseDate: 'DESC' },
        });
    }

    /** Expenses charged to a vehicle. */
    async findByVehicle(vehicleId: number): Promise<Expense[]> {
        return await this.expensesRepository.find({
            where: { vehicle: { id: vehicleId } },
            relations: ['driver', 'vehicle', 'trip', 'evidence', 'consignment'],
            order: { expenseDate: 'DESC' },
        });
    }

    /**
     * Update an expense. Throws NotFoundException if not present.
     */
    async update(id: number, updateExpenseDto: UpdateExpenseDto): Promise<Expense> {
        const existing = await this.findById(id);
        if (!existing) {
            throw new (require('@nestjs/common').NotFoundException)('Expense not found');
        }
        await this.expensesRepository.update(id, updateExpenseDto);
        return this.findById(id) as Promise<Expense>;
    }

    /** Delete an expense. */
    async remove(id: number) {
        const result = await this.expensesRepository.delete(id);
        if (result.affected === 0) {
            throw new (require('@nestjs/common').NotFoundException)('Expense not found');
        }
        return result;
    }

    /** Pending expenses that require approval. */
    async findPendingExpenses(): Promise<Expense[]> {
        return await this.expensesRepository.find({
            where: { status: ExpenseStatus.PENDING },
            relations: ['driver', 'vehicle', 'trip', 'evidence', 'consignment'],
            order: { expenseDate: 'ASC' },
        });
    }

    /** Expenses that lack any attached evidence. */
    async findExpensesWithoutEvidence(): Promise<Expense[]> {
        return await this.expensesRepository.find({
            where: { hasEvidence: false },
            relations: ['driver', 'vehicle', 'trip', 'consignment'],
        });
    }
}