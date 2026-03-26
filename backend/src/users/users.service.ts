import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DriverSummaryDto } from './dto/driver-summary.dto';
import { Vehicle } from '../vehicles/vehicle.entity';
import { ConsignmentStatus } from '../consignments/consignment.entity';
import { AssignDriverVehicleDto } from './dto/assign-driver-vehicle.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Vehicle)
        private vehiclesRepository: Repository<Vehicle>,
    ) { }

    private ensureHistory(user: User): void {
        if (!Array.isArray(user.vehicleAssignmentHistory)) {
            user.vehicleAssignmentHistory = [];
        }
    }

    private closeActiveVehicleAssignment(user: User, endDate: Date): void {
        this.ensureHistory(user);

        for (let index = user.vehicleAssignmentHistory.length - 1; index >= 0; index -= 1) {
            const item = user.vehicleAssignmentHistory[index];
            if (!item.endDate) {
                item.endDate = endDate.toISOString();
                return;
            }
        }
    }

    private addVehicleAssignment(user: User, vehicle: Vehicle, startDate: Date, reason: string, changedBy: string): void {
        this.ensureHistory(user);

        user.vehicleAssignmentHistory.push({
            vehicleId: vehicle.id,
            vehiclePlate: vehicle.licensePlate,
            startDate: startDate.toISOString(),
            endDate: null,
            reason,
            changedBy,
        });
    }

    private async assertVehicleIsAvailable(vehicleId: number, driverId: number): Promise<void> {
        const existingDriver = await this.usersRepository.findOne({
            where: {
                id: driverId,
            },
            relations: ['assignedVehicle'],
        });

        const conflictDriver = await this.usersRepository
            .createQueryBuilder('user')
            .leftJoinAndSelect('user.assignedVehicle', 'assignedVehicle')
            .where('user.id != :driverId', { driverId })
            .andWhere('user.role = :role', { role: UserRole.DRIVER })
            .andWhere('assignedVehicle.id = :vehicleId', { vehicleId })
            .getOne();

        if (conflictDriver && conflictDriver.id !== existingDriver?.id) {
            throw new BadRequestException(
                `El vehículo ${conflictDriver.assignedVehicle?.licensePlate ?? vehicleId} ya está asignado al conductor ${conflictDriver.fullName}.`,
            );
        }
    }

    private async applyVehicleAssignmentChange(
        user: User,
        assignedVehicleId: number | null,
        reason?: string,
        effectiveAt?: string,
        changedBy = 'admin',
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
            await this.assertVehicleIsAvailable(assignedVehicleId, user.id);
        }

        this.closeActiveVehicleAssignment(user, referenceDate);

        if (assignedVehicleId === null) {
            user.assignedVehicle = null;
            return;
        }

        const vehicle = await this.vehiclesRepository.findOne({ where: { id: assignedVehicleId } });
        if (!vehicle) {
            throw new NotFoundException(`Vehicle con id ${assignedVehicleId} no encontrado`);
        }

        user.assignedVehicle = vehicle;
        this.addVehicleAssignment(user, vehicle, referenceDate, normalizedReason, changedBy);
    }

    private sortHistory(items: User['vehicleAssignmentHistory']): User['vehicleAssignmentHistory'] {
        return [...(items ?? [])].sort((first, second) => {
            return new Date(second.startDate).getTime() - new Date(first.startDate).getTime();
        });
    }

    /**
     * Create and save a new user record.
     * @param createUserDto Data transfer object with user properties
     * @returns The persisted user entity
     */
    async create(createUserDto: CreateUserDto): Promise<User> {
        const { assignedVehicleId, password, ...userPayload } = createUserDto;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.usersRepository.create({
            ...userPayload,
            password: hashedPassword,
            vehicleAssignmentHistory: [],
        });

        if (assignedVehicleId) {
            await this.assertVehicleIsAvailable(assignedVehicleId, user.id ?? -1);
            const vehicle = await this.vehiclesRepository.findOne({ where: { id: assignedVehicleId } });
            if (!vehicle) {
                throw new NotFoundException(`Vehicle con id ${assignedVehicleId} no encontrado`);
            }

            user.assignedVehicle = vehicle;
            this.addVehicleAssignment(user, vehicle, new Date(), 'Asignación inicial de conductor', 'admin');
        }

        return await this.usersRepository.save(user);
    }

    /**
     * Retrieve all users.
     * @returns Array of user entities
     */
    async findAll(): Promise<User[]> {
        return await this.usersRepository.find({ relations: ['assignedVehicle'] });
    }

    /**
     * Find a user by its primary identifier.
     * @param id Numeric id of the user
     * @returns The user entity or undefined if not found
     */
    async findById(id: number): Promise<User | null> {
        return await this.usersRepository.findOne({
            where: { id },
            relations: ['assignedVehicle'],
        });
    }

    /**
     * Lookup a user by email address.
     */
    async findByEmail(email: string): Promise<User | null> {
        return await this.usersRepository.findOne({ where: { email }, relations: ['assignedVehicle'] });
    }

    /** Retrieve all users with role DRIVER */
    async findDrivers(): Promise<User[]> {
        return await this.usersRepository.find({
            where: { role: UserRole.DRIVER },
            relations: ['assignedVehicle'],
        });
    }

    /**
     * Retrieve summarized data for driver cards in the admin dashboard.
     */
    async findDriverSummaries(): Promise<DriverSummaryDto[]> {
        const drivers = await this.usersRepository.find({
            where: { role: UserRole.DRIVER },
            relations: ['expenses', 'trips', 'trips.vehicle', 'consignments', 'assignedVehicle'],
            order: { id: 'ASC' },
        });

        return drivers.map((driver) => {
            const monthlySalary = Number(driver.monthlySalary ?? 0);

            const totalAbonos = (driver.consignments ?? [])
                .filter((consignment) => consignment.status === ConsignmentStatus.ACTIVE)
                .reduce((sum, consignment) => sum + Number(consignment.amount ?? 0), 0);

            const pendingBalance = Math.max(0, monthlySalary - totalAbonos);

            const sortedTrips = [...(driver.trips ?? [])].sort((a, b) => {
                const first = new Date(b.startDate).getTime();
                const second = new Date(a.startDate).getTime();
                return first - second;
            });

            const assignedVehiclePlate =
                driver.assignedVehicle?.licensePlate
                ?? sortedTrips.find((trip) => trip.vehicle?.licensePlate)?.vehicle?.licensePlate
                ?? null;

            return {
                id: driver.id,
                fullName: driver.fullName,
                email: driver.email,
                monthlySalary: Number(driver.monthlySalary ?? 0),
                pendingBalance,
                assignedVehiclePlate,
                isActive: driver.isActive,
            };
        });
    }

    /** Retrieve all users with role ADMIN */
    async findAdmins(): Promise<User[]> {
        return await this.usersRepository.find({
            where: { role: UserRole.ADMIN },
            relations: ['assignedVehicle'],
        });
    }

    /** Retrieve only active users */
    async findActive(): Promise<User[]> {
        return await this.usersRepository.find({
            where: { isActive: true },
            relations: ['assignedVehicle'],
        });
    }

    /**
     * Update a user's properties and return the updated record.
     */
    async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
        const existing = await this.findById(id);
        if (!existing) {
            // throw proper HTTP exception when user doesn't exist
            throw new NotFoundException('User not found');
        }

        const { assignedVehicleId, password, assignmentChangeReason, assignmentEffectiveAt, ...userPayload } = updateUserDto;

        if (assignedVehicleId !== undefined) {
            await this.applyVehicleAssignmentChange(
                existing,
                assignedVehicleId,
                assignmentChangeReason,
                assignmentEffectiveAt,
                'admin-panel',
            );
        }

        if (password) {
            existing.password = await bcrypt.hash(password, 10);
        }

        Object.assign(existing, userPayload);
        await this.usersRepository.save(existing);
        return this.findById(id) as Promise<User>;
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
            payload.changedBy ?? 'admin-panel',
        );

        await this.usersRepository.save(driver);
        return (await this.findById(driverId)) as User;
    }

    async getDriverVehicleAssignmentHistory(driverId: number) {
        const driver = await this.findById(driverId);
        if (!driver) {
            throw new NotFoundException('User not found');
        }

        return {
            driverId: driver.id,
            driverName: driver.fullName,
            currentVehicleId: driver.assignedVehicle?.id ?? null,
            currentVehiclePlate: driver.assignedVehicle?.licensePlate ?? null,
            history: this.sortHistory(driver.vehicleAssignmentHistory ?? []),
        };
    }

    getAssignedVehicleIdAtDate(driver: User, referenceDate: Date): number | null {
        this.ensureHistory(driver);

        const referenceTime = referenceDate.getTime();
        const match = driver.vehicleAssignmentHistory.find((item) => {
            const start = new Date(item.startDate).getTime();
            const end = item.endDate ? new Date(item.endDate).getTime() : Number.POSITIVE_INFINITY;
            return start <= referenceTime && referenceTime < end;
        });

        if (match?.vehicleId) {
            return match.vehicleId;
        }

        return driver.assignedVehicle?.id ?? null;
    }

    /** Remove a user by id */
    async remove(id: number) {
        const result = await this.usersRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('User not found');
        }
        return result;
    }

    /** Deactivate a user (set isActive = false) */
    async deactivate(id: number) {
        return await this.update(id, { isActive: false } as any);
    }

    /** Activate a previously deactivated user */
    async activate(id: number) {
        return await this.update(id, { isActive: true } as any);
    }
}
