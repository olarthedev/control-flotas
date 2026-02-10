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

    async create(createUserDto: CreateUserDto) {
        const user = this.usersRepository.create(createUserDto);
        return await this.usersRepository.save(user);
    }

    async findAll() {
        return await this.usersRepository.find();
    }

    async findById(id: number) {
        return await this.usersRepository.findOne({ where: { id } });
    }

    async findByEmail(email: string) {
        return await this.usersRepository.findOne({ where: { email } });
    }

    async findDrivers() {
        return await this.usersRepository.find({
            where: { role: UserRole.DRIVER },
        });
    }

    async findAdmins() {
        return await this.usersRepository.find({
            where: { role: UserRole.ADMIN },
        });
    }

    async findActive() {
        return await this.usersRepository.find({
            where: { isActive: true },
        });
    }

    async update(id: number, updateUserDto: UpdateUserDto) {
        await this.usersRepository.update(id, updateUserDto);
        return this.findById(id);
    }

    async remove(id: number) {
        return await this.usersRepository.delete(id);
    }

    async deactivate(id: number) {
        return await this.update(id, { isActive: false } as any);
    }

    async activate(id: number) {
        return await this.update(id, { isActive: true } as any);
    }
}
