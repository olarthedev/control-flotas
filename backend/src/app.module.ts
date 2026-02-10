import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { ExpensesModule } from './expenses/expenses.module';
import { EvidenceModule } from './evidence/evidence.module';
import { ConsignmentsModule } from './consignments/consignments.module';
import { TripsModule } from './trips/trips.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { User } from './users/user.entity';
import { Vehicle } from './vehicles/vehicle.entity';
import { Expense } from './expenses/expense.entity';
import { Evidence } from './evidence/evidence.entity';
import { Consignment } from './consignments/consignment.entity';
import { Trip } from './trips/trip.entity';
import { MaintenanceRecord } from './maintenance/maintenance-record.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123456',
      database: 'control_flotas',
      entities: [User, Vehicle, Expense, Evidence, Consignment, Trip, MaintenanceRecord],
      synchronize: true,
    }),
    UsersModule,
    VehiclesModule,
    ExpensesModule,
    EvidenceModule,
    ConsignmentsModule,
    TripsModule,
    MaintenanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
