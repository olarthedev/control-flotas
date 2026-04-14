import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { UserVehicleHistory } from './user-vehicle-history.entity';
import { UserBankAccount } from './user-bank-account.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { ChangeUserPasswordUseCase } from './application/change-user-password.use-case';
import { BankAccountsController } from './bank-accounts.controller';
import { BankAccountsService } from './bank-accounts.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Vehicle, UserVehicleHistory, UserBankAccount])],
  controllers: [UsersController, BankAccountsController],
  providers: [UsersService, ChangeUserPasswordUseCase, BankAccountsService],
  exports: [UsersService],
})
export class UsersModule { }
