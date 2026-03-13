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
import { FindExpensesQueryDto } from './dto/find-expenses-query.dto';

export interface PaginatedExpensesResponse {
    data: Expense[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface VehicleExpenseSummaryResponse {
    vehicleId: number;
    licensePlate: string;
    brand: string;
    model: string;
    driverId: number;
    driverName: string;
    totalExpenses: number;
    monthlyTotal: number;
    pendingCount: number;
    approvedCount: number;
    observedCount: number;
    rejectedCount: number;
    lastExpenseDate: string | null;
}

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
     * Retrieve expenses with optional filters and pagination.
     */
    async findAll(query: FindExpensesQueryDto = {}): Promise<PaginatedExpensesResponse> {
        const { page = 1, limit = 20, status, dateFrom, dateTo, vehicleId, driverId } = query;

        const qb = this.expensesRepository
            .createQueryBuilder('expense')
            .leftJoinAndSelect('expense.driver', 'driver')
            .leftJoinAndSelect('expense.vehicle', 'vehicle')
            .leftJoinAndSelect('expense.trip', 'trip')
            .leftJoinAndSelect('expense.evidence', 'evidence')
            .leftJoinAndSelect('expense.consignment', 'consignment')
            .orderBy('expense.expenseDate', 'DESC');

        if (status) {
            qb.andWhere('expense.status = :status', { status });
        }
        if (dateFrom) {
            qb.andWhere('expense.expenseDate >= :dateFrom', { dateFrom: new Date(dateFrom) });
        }
        if (dateTo) {
            qb.andWhere('expense.expenseDate <= :dateTo', { dateTo: new Date(dateTo) });
        }
        if (vehicleId) {
            qb.andWhere('vehicle.id = :vehicleId', { vehicleId });
        }
        if (driverId) {
            qb.andWhere('driver.id = :driverId', { driverId });
        }

        const [data, total] = await qb
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
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

        // Prepare update data with proper type conversions
        const updateData: any = { ...updateExpenseDto };
        if (updateExpenseDto.validatedAt) {
            updateData.validatedAt = new Date(updateExpenseDto.validatedAt);
        }

        await this.expensesRepository.update(id, updateData);
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

    async summaryByVehicle(): Promise<VehicleExpenseSummaryResponse[]> {
        const vehicles = await this.vehiclesRepository.find({
            relations: ['expenses', 'expenses.driver', 'assignedDrivers'],
        });

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const summaries = vehicles.map((vehicle) => {
            const expenses = vehicle.expenses ?? [];

            const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount ?? 0), 0);
            const monthlyTotal = expenses
                .filter((expense) => new Date(expense.expenseDate) >= firstDayOfMonth)
                .reduce((sum, expense) => sum + Number(expense.amount ?? 0), 0);

            const pendingCount = expenses.filter((expense) => expense.status === ExpenseStatus.PENDING).length;
            const approvedCount = expenses.filter((expense) => expense.status === ExpenseStatus.APPROVED).length;
            const observedCount = expenses.filter((expense) => expense.status === ExpenseStatus.OBSERVED).length;
            const rejectedCount = expenses.filter((expense) => expense.status === ExpenseStatus.REJECTED).length;

            const lastExpense = expenses
                .slice()
                .sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime())[0];

            const assignedDriver = vehicle.assignedDrivers?.[0] ?? null;
            const fallbackDriver = lastExpense?.driver ?? null;
            const effectiveDriver = assignedDriver ?? fallbackDriver;

            return {
                vehicleId: vehicle.id,
                licensePlate: vehicle.licensePlate,
                brand: vehicle.brand,
                model: vehicle.model,
                driverId: effectiveDriver?.id ?? -1,
                driverName: effectiveDriver?.fullName ?? 'Sin asignar',
                totalExpenses,
                monthlyTotal,
                pendingCount,
                approvedCount,
                observedCount,
                rejectedCount,
                lastExpenseDate: lastExpense?.expenseDate ? new Date(lastExpense.expenseDate).toISOString() : null,
            };
        });

        return summaries.sort((first, second) => {
            const firstDate = first.lastExpenseDate ? new Date(first.lastExpenseDate).getTime() : 0;
            const secondDate = second.lastExpenseDate ? new Date(second.lastExpenseDate).getTime() : 0;

            if (secondDate !== firstDate) {
                return secondDate - firstDate;
            }

            return first.licensePlate.localeCompare(second.licensePlate);
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