import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense, ExpenseStatus } from './expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { User } from '../users/user.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { Trip } from '../trips/trip.entity';
import { FindExpensesQueryDto } from './dto/find-expenses-query.dto';
import { FindExpensesByVehicleQueryDto } from './dto/find-expenses-by-vehicle-query.dto';
import { UsersService } from '../users/users.service';

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

export interface DriverLiquidationByVehicleItem {
    vehicleId: number;
    licensePlate: string;
    brand: string;
    model: string;
    totalExpenses: number;
}

export interface DriverLiquidationResponse {
    driverId: number;
    dateFrom: string;
    dateTo: string;
    totalExpenses: number;
    totalByVehicle: DriverLiquidationByVehicleItem[];
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
        private readonly usersService: UsersService,
    ) { }

    private readonly openStatuses: ExpenseStatus[] = [ExpenseStatus.PENDING, ExpenseStatus.OBSERVED];
    private readonly closingStatuses: ExpenseStatus[] = [ExpenseStatus.APPROVED, ExpenseStatus.REJECTED];

    private getStartOfWeek(date: Date): Date {
        const copy = new Date(date);
        const day = copy.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        copy.setDate(copy.getDate() + diff);
        copy.setHours(0, 0, 0, 0);
        return copy;
    }

    private async enforceSequentialWeekClosure(existing: Expense, requestedStatus?: ExpenseStatus): Promise<void> {
        if (!requestedStatus || !this.closingStatuses.includes(requestedStatus)) {
            return;
        }

        const vehicleId = existing.vehicle?.id;
        const driverId = existing.driver?.id;

        if (!vehicleId && !driverId) {
            return;
        }

        const qb = this.expensesRepository
            .createQueryBuilder('expense')
            .select(['expense.id', 'expense.expenseDate'])
            .where('expense.status IN (:...statuses)', { statuses: this.openStatuses });

        if (vehicleId) {
            qb.andWhere('expense.vehicleId = :vehicleId', { vehicleId });
        } else {
            qb.andWhere('expense.driverId = :driverId', { driverId });
        }

        const openExpenses = await qb.getMany();
        if (openExpenses.length === 0) {
            return;
        }

        const oldestOpenWeekStart = openExpenses
            .map((expense) => this.getStartOfWeek(new Date(expense.expenseDate)))
            .reduce((min, current) => (current.getTime() < min.getTime() ? current : min));

        const targetWeekStart = this.getStartOfWeek(new Date(existing.expenseDate));
        if (targetWeekStart.getTime() !== oldestOpenWeekStart.getTime()) {
            throw new BadRequestException(
                'Debes cerrar primero la semana pendiente más antigua antes de gestionar gastos de semanas posteriores.',
            );
        }
    }

    /**
     * Create a new expense record, resolving required relations.
     * Validates that expense vehicle matches driver's assignment at expenseDate.
     */
    async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
        const expense = new Expense();
        expense.type = createExpenseDto.type;
        expense.amount = createExpenseDto.amount;
        expense.expenseDate = new Date(createExpenseDto.expenseDate);
        expense.description = createExpenseDto.description ?? null;
        expense.notes = createExpenseDto.notes ?? null;

        const driver = await this.usersRepository.findOne({
            where: { id: createExpenseDto.driverId },
            relations: ['assignedVehicle'],
        });
        if (!driver) {
            throw new NotFoundException(
                `Driver con id ${createExpenseDto.driverId} no encontrado`,
            );
        }
        expense.driver = driver;

        let trip: Trip | null = null;
        if (createExpenseDto.tripId) {
            trip = await this.tripsRepository.findOne({
                where: { id: createExpenseDto.tripId },
                relations: ['driver', 'vehicle'],
            });

            if (!trip) {
                throw new NotFoundException(`Trip con id ${createExpenseDto.tripId} no encontrado`);
            }

            if (trip.driver?.id !== driver.id) {
                throw new BadRequestException('El viaje indicado no pertenece al conductor del gasto.');
            }

            expense.trip = trip;
        }

        const assignedVehicleIdAtExpenseDate = this.usersService.getAssignedVehicleIdAtDate(driver, expense.expenseDate);
        const resolvedVehicleId = createExpenseDto.vehicleId ?? trip?.vehicle?.id ?? assignedVehicleIdAtExpenseDate;

        if (!resolvedVehicleId) {
            throw new BadRequestException(
                'El gasto debe estar asociado a un furgón. Asigna un vehículo al conductor o envía vehicleId.',
            );
        }

        const vehicle = await this.vehiclesRepository.findOne({ where: { id: resolvedVehicleId } });
        if (!vehicle) {
            throw new NotFoundException(`Vehicle con id ${resolvedVehicleId} no encontrado`);
        }

        if (trip?.vehicle?.id && trip.vehicle.id !== vehicle.id) {
            throw new BadRequestException('El vehicleId del gasto debe coincidir con el vehículo del viaje.');
        }

        if (assignedVehicleIdAtExpenseDate !== null && assignedVehicleIdAtExpenseDate !== vehicle.id) {
            throw new BadRequestException(
                'El conductor no tenía asignado ese furgón en la fecha/hora del gasto.',
            );
        }

        expense.vehicle = vehicle;

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
    async findByVehicle(vehicleId: number, query?: FindExpensesByVehicleQueryDto): Promise<Expense[]> {
        const qb = this.expensesRepository
            .createQueryBuilder('expense')
            .leftJoinAndSelect('expense.driver', 'driver')
            .leftJoinAndSelect('expense.vehicle', 'vehicle')
            .leftJoinAndSelect('expense.trip', 'trip')
            .leftJoinAndSelect('expense.evidence', 'evidence')
            .leftJoinAndSelect('expense.consignment', 'consignment')
            .where('vehicle.id = :vehicleId', { vehicleId })
            .orderBy('expense.expenseDate', 'DESC');

        if (query?.dateFrom) {
            qb.andWhere('expense.expenseDate >= :dateFrom', { dateFrom: new Date(query.dateFrom) });
        }

        if (query?.dateTo) {
            qb.andWhere('expense.expenseDate <= :dateTo', { dateTo: new Date(query.dateTo) });
        }

        if (query?.statuses?.length) {
            qb.andWhere('expense.status IN (:...statuses)', { statuses: query.statuses });
        }

        return await qb.getMany();
    }

    /**
     * Update an expense. Throws NotFoundException if not present.
     */
    async update(id: number, updateExpenseDto: UpdateExpenseDto): Promise<Expense> {
        const existing = await this.findById(id);
        if (!existing) {
            throw new NotFoundException('Expense not found');
        }

        await this.enforceSequentialWeekClosure(existing, updateExpenseDto.status);

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
            throw new NotFoundException('Expense not found');
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

    async getDriverLiquidation(
        driverId: number,
        dateFrom: Date,
        dateTo: Date,
    ): Promise<DriverLiquidationResponse> {
        const expenses = await this.expensesRepository
            .createQueryBuilder('expense')
            .leftJoinAndSelect('expense.vehicle', 'vehicle')
            .leftJoin('expense.driver', 'driver')
            .where('driver.id = :driverId', { driverId })
            .andWhere('expense.expenseDate >= :dateFrom', { dateFrom })
            .andWhere('expense.expenseDate <= :dateTo', { dateTo })
            .orderBy('expense.expenseDate', 'ASC')
            .getMany();

        const totalsByVehicle = new Map<number, DriverLiquidationByVehicleItem>();
        let totalExpenses = 0;

        for (const expense of expenses) {
            const amount = Number(expense.amount ?? 0);
            totalExpenses += amount;

            const vehicleId = expense.vehicle?.id;
            if (!vehicleId || !expense.vehicle) {
                continue;
            }

            const current = totalsByVehicle.get(vehicleId);
            if (current) {
                current.totalExpenses += amount;
                continue;
            }

            totalsByVehicle.set(vehicleId, {
                vehicleId,
                licensePlate: expense.vehicle.licensePlate,
                brand: expense.vehicle.brand,
                model: expense.vehicle.model,
                totalExpenses: amount,
            });
        }

        return {
            driverId,
            dateFrom: dateFrom.toISOString(),
            dateTo: dateTo.toISOString(),
            totalExpenses,
            totalByVehicle: [...totalsByVehicle.values()].sort((first, second) => second.totalExpenses - first.totalExpenses),
        };
    }
}
