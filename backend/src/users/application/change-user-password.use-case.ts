import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../user.entity';
import { ChangePasswordDto } from '../dto/change-password.dto';

/**
 * Use case: Change a user's password.
 * Validates the current password before saving the new one.
 * Never exposes the hashed password in its result.
 */
@Injectable()
export class ChangeUserPasswordUseCase {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) { }

    async execute(userId: number, dto: ChangePasswordDto): Promise<void> {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with id ${userId} not found`);
        }

        const passwordMatch = await bcrypt.compare(dto.currentPassword, user.password);
        if (!passwordMatch) {
            throw new UnauthorizedException('Current password is incorrect');
        }

        user.password = await bcrypt.hash(dto.newPassword, 10);
        await this.usersRepository.save(user);
    }
}
