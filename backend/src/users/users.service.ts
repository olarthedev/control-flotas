import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    /**
     * Create and save a new user record.
     * @param createUserDto Data transfer object with user properties
     * @returns The persisted user entity
     */
    async create(createUserDto: CreateUserDto): Promise<User> {
        const user = this.usersRepository.create(createUserDto);
        return await this.usersRepository.save(user);
    }

    /**
     * Retrieve all users.
     * @returns Array of user entities
     */
    async findAll(): Promise<User[]> {
        return await this.usersRepository.find();
    }

    /**
     * Find a user by its primary identifier.
     * @param id Numeric id of the user
     * @returns The user entity or undefined if not found
     */
    async findById(id: number): Promise<User | null> {
        return await this.usersRepository.findOne({ where: { id } });
    }

    /**
     * Lookup a user by email address.
     */
    async findByEmail(email: string): Promise<User | null> {
        return await this.usersRepository.findOne({ where: { email } });
    }

    /** Retrieve all users with role DRIVER */
    async findDrivers(): Promise<User[]> {
        return await this.usersRepository.find({
            where: { role: UserRole.DRIVER },
        });
    }

    /** Retrieve all users with role ADMIN */
    async findAdmins(): Promise<User[]> {
        return await this.usersRepository.find({
            where: { role: UserRole.ADMIN },
        });
    }

    /** Retrieve only active users */
    async findActive(): Promise<User[]> {
        return await this.usersRepository.find({
            where: { isActive: true },
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
        await this.usersRepository.update(id, updateUserDto);
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
