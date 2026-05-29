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

    async create(createConsignmentDto: CreateConsignmentDto): Promise<Consignment> {
        const consignment = new Consignment();
        consignment.consignmentNumber = createConsignmentDto.consignmentNumber;
        consignment.amount = createConsignmentDto.amount;
        consignment.purpose = createConsignmentDto.purpose;
        consignment.consignmentDate = new Date(createConsignmentDto.consignmentDate);

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
            const trip = await this.tripsRepository.findOne({
                where: { id: createConsignmentDto.tripId },
                relations: ['driver', 'vehicle'],
            });
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

        if (consignment.purpose === ConsignmentPurpose.TRIP_ADVANCE && !consignment.trip) {
            throw new BadRequestException('Las consignaciones de tipo trip_advance requieren un tripId válido.');
        }

        if (consignment.purpose === ConsignmentPurpose.SALARY_ADVANCE && consignment.trip) {
            throw new BadRequestException('Las consignaciones de tipo salary_advance no pueden tener tripId.');
        }

        consignment.totalExpensesReported = 0;
        consignment.totalApprovedExpenses = 0;

        return await this.consignmentsRepository.save(consignment);
    }

    async findAll(): Promise<Consignment[]> {
        return await this.consignmentsRepository.find({
            relations: ['driver', 'vehicle', 'trip', 'expenses'],
        });
    }

    async findById(id: number): Promise<Consignment | null> {
        return await this.consignmentsRepository.findOne({
            where: { id },
            relations: ['driver', 'vehicle', 'trip', 'expenses'],
        });
    }

    async findByDriver(driverId: number): Promise<Consignment[]> {
        return await this.consignmentsRepository.find({
            where: { driver: { id: driverId } },
            relations: ['driver', 'vehicle', 'trip', 'expenses'],
            order: { consignmentDate: 'DESC' },
        });
    }

    async closeDriverActiveConsignments(driverId: number): Promise<{ updated: number }> {
        const openConsignments = await this.consignmentsRepository.find({
            where: {
                driver: { id: driverId },
                status: ConsignmentStatus.OPEN,
            },
        });

        if (!openConsignments.length) {
            return { updated: 0 };
        }

        const ids = openConsignments.map((consignment) => consignment.id);

        await this.consignmentsRepository.update(
            { id: In(ids) },
            {
                status: ConsignmentStatus.CLOSED,
                closingDate: new Date(),
            },
        );

        return { updated: ids.length };
    }

    async findOpen(): Promise<Consignment[]> {
        return await this.consignmentsRepository.find({
            where: { status: ConsignmentStatus.OPEN },
            relations: ['driver', 'vehicle', 'trip', 'expenses'],
        });
    }

    async update(id: number, updateConsignmentDto: UpdateConsignmentDto): Promise<Consignment> {
        const existing = await this.findById(id);
        if (!existing) {
            throw new NotFoundException('Consignment not found');
        }

        if (updateConsignmentDto.amount !== undefined) existing.amount = updateConsignmentDto.amount;
        if (updateConsignmentDto.purpose !== undefined) existing.purpose = updateConsignmentDto.purpose;
        if (updateConsignmentDto.status !== undefined) existing.status = updateConsignmentDto.status;
        if (updateConsignmentDto.consignmentDate !== undefined) {
            existing.consignmentDate = new Date(updateConsignmentDto.consignmentDate);
        }
        if (updateConsignmentDto.closingDate !== undefined) {
            existing.closingDate = updateConsignmentDto.closingDate ? new Date(updateConsignmentDto.closingDate) : null;
        }

        if (updateConsignmentDto.tripId !== undefined) {
            const trip = await this.tripsRepository.findOne({ where: { id: updateConsignmentDto.tripId } });
            if (!trip) {
                throw new NotFoundException(`Trip con id ${updateConsignmentDto.tripId} no encontrado`);
            }
            existing.trip = trip;
        }

        if (updateConsignmentDto.vehicleId !== undefined) {
            const vehicle = await this.vehiclesRepository.findOne({ where: { id: updateConsignmentDto.vehicleId } });
            if (!vehicle) {
                throw new NotFoundException(`Vehicle con id ${updateConsignmentDto.vehicleId} no encontrado`);
            }
            existing.vehicle = vehicle;
        }

        if (updateConsignmentDto.driverId !== undefined) {
            const driver = await this.usersRepository.findOne({ where: { id: updateConsignmentDto.driverId } });
            if (!driver) {
                throw new NotFoundException(`Driver con id ${updateConsignmentDto.driverId} no encontrado`);
            }
            existing.driver = driver;
        }

        await this.consignmentsRepository.save(existing);
        return this.findById(id) as Promise<Consignment>;
    }

    async remove(id: number) {
        const result = await this.consignmentsRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('Consignment not found');
        }
        return result;
    }

    async closeConsignment(id: number): Promise<Consignment> {
        const consignment = await this.findById(id);
        if (!consignment) {
            throw new NotFoundException('Consignment not found');
        }

        const approvedExpenses = await this.expenseRepository.find({
            where: {
                consignment: { id: consignment.id },
                status: ExpenseStatus.APPROVED,
            },
        });

        const totalApproved = approvedExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

        return await this.update(id, {
            status: ConsignmentStatus.CLOSED,
            closingDate: new Date().toISOString(),
            totalApprovedExpenses: totalApproved,
        } as unknown as UpdateConsignmentDto);
    }
}
