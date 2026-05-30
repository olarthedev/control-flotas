import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DriverSummaryDto } from './dto/driver-summary.dto';
import { Vehicle } from '../vehicles/vehicle.entity';
import { AssignDriverVehicleDto } from './dto/assign-driver-vehicle.dto';
import { UserVehicleHistory } from './user-vehicle-history.entity';
import { Consignment, ConsignmentPurpose, ConsignmentStatus } from '../consignments/consignment.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        @InjectRepository(Vehicle)
        private readonly vehiclesRepository: Repository<Vehicle>,
        @InjectRepository(UserVehicleHistory)
        private readonly historyRepository: Repository<UserVehicleHistory>,
        @InjectRepository(Consignment)
        private readonly consignmentsRepository: Repository<Consignment>,
    ) { }

    private async assertVehicleIsAvailableAtDate(
        vehicleId: number,
        driverId: number,
        effectiveAt: Date,
    ): Promise<void> {
        const conflict = await this.historyRepository
            .createQueryBuilder('history')
            .innerJoin('history.user', 'user')
            .where('history.vehicle_id = :vehicleId', { vehicleId })
            .andWhere('user.id != :driverId', { driverId })
            .andWhere('history.start_date <= :effectiveAt', { effectiveAt })
            .andWhere(new Brackets((qb) => {
                qb.where('history.end_date IS NULL').orWhere('history.end_date > :effectiveAt', { effectiveAt });
            }))
            .getOne();

        if (conflict) {
            throw new BadRequestException(
                `El vehículo ${vehicleId} ya está asignado a otro conductor para la fecha indicada.`,
            );
        }
    }

    private async closeActiveVehicleAssignments(userId: number, endDate: Date): Promise<void> {
        await this.historyRepository
            .createQueryBuilder()
            .update(UserVehicleHistory)
            .set({ endDate })
            .where('user_id = :userId', { userId })
            .andWhere('end_date IS NULL')
            .execute();
    }

    private async createVehicleAssignmentHistory(
        user: User,
        vehicle: Vehicle,
        startDate: Date,
    ): Promise<void> {
        const history = this.historyRepository.create({
            user,
            vehicle,
            startDate,
            endDate: null,
        });

        await this.historyRepository.save(history);
    }

    private async applyVehicleAssignmentChange(
        user: User,
        assignedVehicleId: number | null,
        reason?: string,
        effectiveAt?: string,
    ): Promise<void> {
        const normalizedReason = reason?.trim();
        const referenceDate = effectiveAt ? new Date(effectiveAt) : new Date();

        if (Number.isNaN(referenceDate.getTime())) {
            throw new BadRequestException('assignmentEffectiveAt no es una fecha válida.');
        }

        const currentVehicleId = user.assignedVehicle?.id ?? null;
        if (assignedVehicleId === currentVehicleId) {
            return;
        }

        if (!normalizedReason) {
            throw new BadRequestException('Debes registrar el motivo del cambio de furgón.');
        }

        if (assignedVehicleId !== null) {
            await this.assertVehicleIsAvailableAtDate(assignedVehicleId, user.id, referenceDate);
        }

        await this.closeActiveVehicleAssignments(user.id, referenceDate);

        if (assignedVehicleId === null) {
            user.assignedVehicle = null;
            return;
        }

        const vehicle = await this.vehiclesRepository.findOne({ where: { id: assignedVehicleId } });
        if (!vehicle) {
            throw new NotFoundException(`Vehicle con id ${assignedVehicleId} no encontrado`);
        }

        user.assignedVehicle = vehicle;
        await this.createVehicleAssignmentHistory(user, vehicle, referenceDate);
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const { assignedVehicleId, password, ...userPayload } = createUserDto;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.usersRepository.create({
            ...userPayload,
            password: hashedPassword,
        });

        let assignedVehicle: Vehicle | null = null;
        if (assignedVehicleId) {
            const effectiveAt = new Date();
            await this.assertVehicleIsAvailableAtDate(assignedVehicleId, user.id ?? -1, effectiveAt);
            assignedVehicle = await this.vehiclesRepository.findOne({ where: { id: assignedVehicleId } });
            if (!assignedVehicle) {
                throw new NotFoundException(`Vehicle con id ${assignedVehicleId} no encontrado`);
            }
            user.assignedVehicle = assignedVehicle;
        }

        const savedUser = await this.usersRepository.save(user);

        if (assignedVehicle) {
            await this.createVehicleAssignmentHistory(savedUser, assignedVehicle, new Date());
        }

        return savedUser;
    }

    async findAll(): Promise<User[]> {
        return await this.usersRepository.find({ relations: ['assignedVehicle'] });
    }

    async findById(id: number, includeHistory = false): Promise<User | null> {
        const relations = ['assignedVehicle'];
        if (includeHistory) {
            relations.push('vehicleAssignmentHistory');
        }
        return await this.usersRepository.findOne({
            where: { id },
            relations,
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return await this.usersRepository.findOne({ where: { email }, relations: ['assignedVehicle'] });
    }

    async findDrivers(): Promise<User[]> {
        return await this.usersRepository.find({
            where: { role: UserRole.DRIVER },
            relations: ['assignedVehicle'],
        });
    }

    async findDriverSummaries(): Promise<DriverSummaryDto[]> {
        const drivers = await this.usersRepository.find({
            where: { role: UserRole.DRIVER },
            relations: ['assignedVehicle', 'trips', 'trips.vehicle'],
            order: { id: 'ASC' },
        });

        const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

        const salaryRows = await this.consignmentsRepository
            .createQueryBuilder('c')
            .select('c.driver_id', 'driverId')
            .addSelect('COALESCE(SUM(c.amount), 0)', 'total')
            .where('c.purpose = :purpose', { purpose: ConsignmentPurpose.SALARY_ADVANCE })
            .andWhere('c.status = :status', { status: ConsignmentStatus.OPEN })
            .andWhere('c.consignment_date >= :monthStart', { monthStart: currentMonthStart })
            .groupBy('c.driver_id')
            .getRawMany<{ driverId: string; total: string }>();

        const paidByDriver = new Map<number, number>(
            salaryRows.map((row) => [Number(row.driverId), parseFloat(row.total)]),
        );

        return drivers.map((driver) => {
            const sortedTrips = [...(driver.trips ?? [])].sort((a, b) => {
                const first = b.startDate?.getTime() ?? 0;
                const second = a.startDate?.getTime() ?? 0;
                return first - second;
            });

            const assignedVehiclePlate =
                driver.assignedVehicle?.licensePlate
                ?? sortedTrips.find((trip) => trip.vehicle?.licensePlate)?.vehicle?.licensePlate
                ?? null;

            const monthlySalary = driver.monthlySalary ?? 0;
            const paid = paidByDriver.get(driver.id) ?? 0;
            const pendingBalance = Math.max(0, monthlySalary - paid);

            return {
                id: driver.id,
                fullName: driver.fullName,
                email: driver.email,
                monthlySalary,
                pendingBalance,
                assignedVehiclePlate,
                isActive: driver.isActive,
            };
        });
    }

    async findAdmins(): Promise<User[]> {
        return await this.usersRepository.find({
            where: { role: UserRole.ADMIN },
            relations: ['assignedVehicle'],
        });
    }

    async findActive(): Promise<User[]> {
        return await this.usersRepository.find({
            where: { isActive: true },
            relations: ['assignedVehicle'],
        });
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const existing = await this.findById(id);
        if (!existing) {
            throw new NotFoundException('User not found');
        }

        const { assignedVehicleId, password, assignmentChangeReason, assignmentEffectiveAt, ...userPayload } = updateUserDto;

        if (assignedVehicleId !== undefined) {
            await this.applyVehicleAssignmentChange(
                existing,
                assignedVehicleId,
                assignmentChangeReason,
                assignmentEffectiveAt,
            );
        }

        if (password) {
            existing.password = await bcrypt.hash(password, 10);
        }

        Object.assign(existing, userPayload);
        await this.usersRepository.save(existing);
        return (await this.findById(id)) as User;
    }

    async assignDriverVehicle(driverId: number, payload: AssignDriverVehicleDto): Promise<User> {
        const driver = await this.findById(driverId);
        if (!driver) {
            throw new NotFoundException('User not found');
        }

        if (driver.role !== UserRole.DRIVER) {
            throw new BadRequestException('Solo se pueden reasignar usuarios con rol DRIVER.');
        }

        await this.applyVehicleAssignmentChange(
            driver,
            payload.assignedVehicleId,
            payload.assignmentChangeReason,
            payload.assignmentEffectiveAt,
        );

        await this.usersRepository.save(driver);
        return (await this.findById(driverId)) as User;
    }

    async getDriverVehicleAssignmentHistory(driverId: number) {
        const driver = await this.findById(driverId);
        if (!driver) {
            throw new NotFoundException('User not found');
        }

        const historyRecords = await this.historyRepository.find({
            where: { user: { id: driverId } },
            relations: ['vehicle'],
            order: { startDate: 'DESC' },
        });

        return {
            driverId: driver.id,
            driverName: driver.fullName,
            currentVehicleId: driver.assignedVehicle?.id ?? null,
            currentVehiclePlate: driver.assignedVehicle?.licensePlate ?? null,
            history: historyRecords.map((item) => ({
                vehicleId: item.vehicle.id,
                vehiclePlate: item.vehicle.licensePlate,
                startDate: item.startDate,
                endDate: item.endDate,
            })),
        };
    }

    async getAssignedVehicleIdAtDate(driver: User, referenceDate: Date): Promise<number | null> {
        const history = await this.historyRepository
            .createQueryBuilder('history')
            .leftJoinAndSelect('history.vehicle', 'vehicle')
            .where('history.user_id = :userId', { userId: driver.id })
            .andWhere('history.start_date <= :referenceDate', { referenceDate })
            .andWhere(new Brackets((qb) => {
                qb.where('history.end_date IS NULL').orWhere('history.end_date > :referenceDate', { referenceDate });
            }))
            .orderBy('history.start_date', 'DESC')
            .getOne();

        if (history?.vehicle?.id) {
            return history.vehicle.id;
        }

        return driver.assignedVehicle?.id ?? null;
    }

    async remove(id: number) {
        const result = await this.usersRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('User not found');
        }
        return result;
    }

    async deactivate(id: number) {
        return await this.update(id, { isActive: false } as Partial<User>);
    }

    async activate(id: number) {
        return await this.update(id, { isActive: true } as Partial<User>);
    }
}
