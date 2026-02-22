import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Consignment, ConsignmentStatus } from './consignment.entity';
import { CreateConsignmentDto } from './dto/create-consignment.dto';
import { UpdateConsignmentDto } from './dto/update-consignment.dto';
import { User } from '../users/user.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { Trip } from '../trips/trip.entity';
import { Expense, ExpenseStatus } from '../expenses/expense.entity';

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
        @InjectRepository(Expense)
        private expenseRepository: Repository<Expense>,
    ) { }

    /**
     * Create a new consignment and initialize its balances.
     */
    async create(createConsignmentDto: CreateConsignmentDto): Promise<Consignment> {
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

        // Inicializar saldos
        consignment.totalExpensesReported = 0;
        consignment.totalApprovedExpenses = 0;
        consignment.balance = consignment.amount;
        consignment.surplus = 0;
        consignment.deficit = 0;

        return await this.consignmentsRepository.save(consignment);
    }

    /** Get every consignment with relations. */
    async findAll(): Promise<Consignment[]> {
        return await this.consignmentsRepository.find({
            relations: ['driver', 'vehicle', 'trip', 'expenses'],
        });
    }

    /** Find one consignment by id. */
    async findById(id: number): Promise<Consignment | null> {
        return await this.consignmentsRepository.findOne({
            where: { id },
            relations: ['driver', 'vehicle', 'trip', 'expenses'],
        });
    }

    /** Consignments belonging to a specific driver. */
    async findByDriver(driverId: number): Promise<Consignment[]> {
        return await this.consignmentsRepository.find({
            where: { driver: { id: driverId } },
            relations: ['driver', 'vehicle', 'trip', 'expenses'],
            order: { consignmentDate: 'DESC' },
        });
    }

    /** Only consignments in ACTIVE status */
    async findActive(): Promise<Consignment[]> {
        return await this.consignmentsRepository.find({
            where: { status: ConsignmentStatus.ACTIVE },
            relations: ['driver', 'vehicle', 'trip', 'expenses'],
        });
    }

    /** Update a consignment; throws if not found. */
    async update(id: number, updateConsignmentDto: UpdateConsignmentDto): Promise<Consignment> {
        const existing = await this.findById(id);
        if (!existing) {
            throw new (require('@nestjs/common').NotFoundException)('Consignment not found');
        }
        await this.consignmentsRepository.update(id, updateConsignmentDto as any);
        return this.findById(id) as Promise<Consignment>;
    }

    /** Delete a consignment. */
    async remove(id: number) {
        const result = await this.consignmentsRepository.delete(id);
        if (result.affected === 0) {
            throw new (require('@nestjs/common').NotFoundException)('Consignment not found');
        }
        return result;
    }

    /**
     * Close a consignment by calculating approved expenses and adjusting
     * balance, surplus, deficit and fullyClosed flag.
     */
    async closeConsignment(id: number): Promise<Consignment> {
        const consignment = await this.findById(id);
        if (!consignment) {
            throw new (require('@nestjs/common').NotFoundException)('Consignment not found');
        }

        // Calcular totales de gastos aprobados
        const approvedExpenses = await this.expenseRepository.find({
            where: {
                consignment: { id: consignment.id },
                status: ExpenseStatus.APPROVED,
            },
        });

        const totalApproved = approvedExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
        const balance = consignment.amount - totalApproved;

        const updateData: any = {
            status: 'CLOSED',
            closingDate: new Date(),
            totalApprovedExpenses: totalApproved,
            balance: balance,
        };

        if (balance > 0) {
            updateData.surplus = balance;
            updateData.deficit = 0;
            updateData.fullyClosed = false;
        } else if (balance < 0) {
            updateData.surplus = 0;
            updateData.deficit = Math.abs(balance);
            updateData.fullyClosed = false;
        } else {
            updateData.surplus = 0;
            updateData.deficit = 0;
            updateData.fullyClosed = true;
        }

        return await this.update(id, updateData);
    }
}
