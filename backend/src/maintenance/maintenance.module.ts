import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceController } from './maintenance.controller';
import { MaintenanceRecord } from './maintenance-record.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { User } from '../users/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([MaintenanceRecord, Vehicle, User])],
    controllers: [MaintenanceController],
    providers: [MaintenanceService],
    exports: [MaintenanceService],
})
export class MaintenanceModule { }
