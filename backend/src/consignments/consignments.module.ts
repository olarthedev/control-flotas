import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsignmentsService } from './consignments.service';
import { ConsignmentsController } from './consignments.controller';
import { Consignment } from './consignment.entity';
import { User } from '../users/user.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { Trip } from '../trips/trip.entity';
import { Expense } from '../expenses/expense.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Consignment, User, Vehicle, Trip, Expense])],
    controllers: [ConsignmentsController],
    providers: [ConsignmentsService],
    exports: [ConsignmentsService],
})
export class ConsignmentsModule { }
