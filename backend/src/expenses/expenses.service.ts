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

    async create(createExpenseDto: CreateExpenseDto) {
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
                throw new Error(`Driver con id ${createExpenseDto.driverId} no encontrado`);
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

    async findAll() {
        return await this.expensesRepository.find({
            relations: ['driver', 'vehicle', 'trip', 'evidence', 'consignment'],
        });
    }

    async findById(id: number) {
        return await this.expensesRepository.findOne({
            where: { id },
            relations: ['driver', 'vehicle', 'trip', 'evidence', 'consignment'],
        });
    }

    async findByDriver(driverId: number) {
        return await this.expensesRepository.find({
            where: { driver: { id: driverId } },
            relations: ['driver', 'vehicle', 'trip', 'evidence', 'consignment'],
            order: { expenseDate: 'DESC' },
        });
    }

    async findByTrip(tripId: number) {
        return await this.expensesRepository.find({
            where: { trip: { id: tripId } },
            relations: ['driver', 'vehicle', 'trip', 'evidence', 'consignment'],
            order: { expenseDate: 'DESC' },
        });
    }

    async findByVehicle(vehicleId: number) {
        return await this.expensesRepository.find({
            where: { vehicle: { id: vehicleId } },
            relations: ['driver', 'vehicle', 'trip', 'evidence', 'consignment'],
            order: { expenseDate: 'DESC' },
        });
    }

    async update(id: number, updateExpenseDto: UpdateExpenseDto) {
        await this.expensesRepository.update(id, updateExpenseDto);
        return this.findById(id);
    }

    async remove(id: number) {
        return await this.expensesRepository.delete(id);
    }

    async findPendingExpenses() {
        return await this.expensesRepository.find({
            where: { status: ExpenseStatus.PENDING },
            relations: ['driver', 'vehicle', 'trip', 'evidence', 'consignment'],
            order: { expenseDate: 'ASC' },
        });
    }

    async findExpensesWithoutEvidence() {
        return await this.expensesRepository.find({
            where: { hasEvidence: false },
            relations: ['driver', 'vehicle', 'trip', 'consignment'],
        });
    }
}
