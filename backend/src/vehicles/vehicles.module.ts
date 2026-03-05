import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiclesController } from './vehicles.controller';
import { VehiclesService } from './vehicles.service';
import { Vehicle } from './vehicle.entity';
import { Trip } from '../trips/trip.entity';
import { Expense } from '../expenses/expense.entity';
import { MaintenanceRecord } from '../maintenance/maintenance-record.entity';
import { Consignment } from '../consignments/consignment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vehicle, Trip, Expense, MaintenanceRecord, Consignment])],
  controllers: [VehiclesController],
  providers: [VehiclesService],
  exports: [VehiclesService],
})
export class VehiclesModule { }
