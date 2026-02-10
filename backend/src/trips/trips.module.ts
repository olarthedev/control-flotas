import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TripsService } from './trips.service';
import { TripsController } from './trips.controller';
import { Trip } from './trip.entity';
import { User } from '../users/user.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { Expense } from '../expenses/expense.entity';
import { Consignment } from '../consignments/consignment.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Trip, User, Vehicle, Expense, Consignment])],
    controllers: [TripsController],
    providers: [TripsService],
    exports: [TripsService],
})
export class TripsModule { }
