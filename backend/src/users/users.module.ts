import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { ChangeUserPasswordUseCase } from './application/change-user-password.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([User, Vehicle])],
  controllers: [UsersController],
  providers: [UsersService, ChangeUserPasswordUseCase],
  exports: [UsersService],
})
export class UsersModule { }
