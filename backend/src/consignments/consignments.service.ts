import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Consignment, ConsignmentStatus, ConsignmentPurpose } from './consignment.entity';
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
        consignment.purpose = createConsignmentDto.purpose;
        consignment.consignmentDate = new Date(createConsignmentDto.consignmentDate);
        consignment.consignmentNotes = createConsignmentDto.consignmentNotes ?? null;

        const driver = await this.usersRepository.findOne({ where: { id: createConsignmentDto.driverId } });
        if (!driver) {
            throw new NotFoundException(`Driver con id ${createConsignmentDto.driverId} no encontrado`);
        }
        consignment.driver = driver;

        if (createConsignmentDto.vehicleId) {
            const vehicle = await this.vehiclesRepository.findOne({ where: { id: createConsignmentDto.vehicleId } });
            if (!vehicle) {
                throw new NotFoundException(`Vehicle con id ${createConsignmentDto.vehicleId} no encontrado`);
            }
            consignment.vehicle = vehicle;
        }

        if (createConsignmentDto.tripId) {
            const trip = await this.tripsRepository.findOne({ where: { id: createConsignmentDto.tripId }, relations: ['driver', 'vehicle'] });
            if (!trip) {
                throw new NotFoundException(`Trip con id ${createConsignmentDto.tripId} no encontrado`);
            }
            if (trip.driver?.id !== driver.id) {
                throw new BadRequestException('El viaje indicado no pertenece al conductor de la consignación.');
            }
            consignment.trip = trip;
            if (!consignment.vehicle) {
                consignment.vehicle = trip.vehicle;
            }
        }

        if (consignment.purpose === ConsignmentPurpose.TRIP_EXPENSES && !consignment.trip) {
            throw new BadRequestException('Las consignaciones de tipo TRIP_EXPENSES requieren un tripId válido.');
        }

        if (consignment.purpose === ConsignmentPurpose.SALARY_ADVANCE && consignment.trip) {
            throw new BadRequestException('Las consignaciones de tipo SALARY_ADVANCE no pueden tener tripId.');
        }

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

    /**
     * Close all ACTIVE consignments for a driver (used to start a new salary month).
     */
    async closeDriverActiveConsignments(driverId: number): Promise<{ updated: number }> {
        const activeConsignments = await this.consignmentsRepository.find({
            where: {
                driver: { id: driverId },
                status: ConsignmentStatus.ACTIVE,
            },
        });

        if (!activeConsignments.length) {
            return { updated: 0 };
        }

        const ids = activeConsignments.map((consignment) => consignment.id);

        await this.consignmentsRepository.update(
            { id: In(ids) },
            {
                status: ConsignmentStatus.CLOSED,
                closingDate: new Date(),
                closingNotes: 'Cierre mensual automático desde módulo de conductores',
            },
        );

        return { updated: ids.length };
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
            throw new NotFoundException('Consignment not found');
        }

        const updateData = { ...updateConsignmentDto } as unknown as Partial<Consignment>;
        if (updateConsignmentDto.consignmentDate !== undefined) {
            updateData.consignmentDate = new Date(updateConsignmentDto.consignmentDate);
        }

        if (updateConsignmentDto.tripId !== undefined) {
            const trip = await this.tripsRepository.findOne({ where: { id: updateConsignmentDto.tripId } });
            if (!trip) {
                throw new NotFoundException(`Trip con id ${updateConsignmentDto.tripId} no encontrado`);
            }
            updateData.trip = trip;
        }

        if (updateConsignmentDto.vehicleId !== undefined) {
            const vehicle = await this.vehiclesRepository.findOne({ where: { id: updateConsignmentDto.vehicleId } });
            if (!vehicle) {
                throw new NotFoundException(`Vehicle con id ${updateConsignmentDto.vehicleId} no encontrado`);
            }
            updateData.vehicle = vehicle;
        }

        if (updateConsignmentDto.driverId !== undefined) {
            const driver = await this.usersRepository.findOne({ where: { id: updateConsignmentDto.driverId } });
            if (!driver) {
                throw new NotFoundException(`Driver con id ${updateConsignmentDto.driverId} no encontrado`);
            }
            updateData.driver = driver;
        }

        await this.consignmentsRepository.update(id, updateData);
        return this.findById(id) as Promise<Consignment>;
    }

    /** Delete a consignment. */
    async remove(id: number) {
        const result = await this.consignmentsRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('Consignment not found');
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
            throw new NotFoundException('Consignment not found');
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
            status: ConsignmentStatus.CLOSED,
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
