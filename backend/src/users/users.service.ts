import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ExpenseStatus } from '../expenses/expense.entity';
import { DriverSummaryDto } from './dto/driver-summary.dto';
import { Vehicle } from '../vehicles/vehicle.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Vehicle)
        private vehiclesRepository: Repository<Vehicle>,
    ) { }

    /**
     * Create and save a new user record.
     * @param createUserDto Data transfer object with user properties
     * @returns The persisted user entity
     */
    async create(createUserDto: CreateUserDto): Promise<User> {
        const { assignedVehicleId, password, ...userPayload } = createUserDto;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.usersRepository.create({ ...userPayload, password: hashedPassword });

        if (assignedVehicleId) {
            const vehicle = await this.vehiclesRepository.findOne({ where: { id: assignedVehicleId } });
            if (vehicle) {
                user.assignedVehicle = vehicle;
            }
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
            relations: ['expenses', 'trips', 'trips.vehicle'],
            order: { id: 'ASC' },
        });

        return drivers.map((driver) => {
            const pendingBalance = (driver.expenses ?? [])
                .filter((expense) => expense.status === ExpenseStatus.PENDING)
                .reduce((sum, expense) => sum + Number(expense.amount ?? 0), 0);

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
            throw new (require('@nestjs/common').NotFoundException)('User not found');
        }

        const { assignedVehicleId, password, ...userPayload } = updateUserDto;

        if (assignedVehicleId !== undefined) {
            if (assignedVehicleId === null) {
                existing.assignedVehicle = null;
            } else {
                const vehicle = await this.vehiclesRepository.findOne({ where: { id: assignedVehicleId } });
                existing.assignedVehicle = vehicle ?? null;
            }
        }

        if (password) {
            existing.password = await bcrypt.hash(password, 10);
        }

        Object.assign(existing, userPayload);
        await this.usersRepository.save(existing);
        return this.findById(id) as Promise<User>;
    }

    /** Remove a user by id */
    async remove(id: number) {
        const result = await this.usersRepository.delete(id);
        if (result.affected === 0) {
            throw new (require('@nestjs/common').NotFoundException)('User not found');
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
