import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    async create(createUserDto: CreateUserDto) {
        const user = this.usersRepository.create(createUserDto as any);
        return await this.usersRepository.save(user);
    }

    async findAll() {
        return await this.usersRepository.find();
    }

    async findById(id: number) {
        return await this.usersRepository.findOne({ where: { id } });
    }
}
