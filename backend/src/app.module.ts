import { Module, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_PIPE } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { ExpensesModule } from './expenses/expenses.module';
import { EvidenceModule } from './evidence/evidence.module';
import { ConsignmentsModule } from './consignments/consignments.module';
import { TripsModule } from './trips/trips.module';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { User } from './users/user.entity';
import { Vehicle } from './vehicles/vehicle.entity';
import { Expense } from './expenses/expense.entity';
import { Evidence } from './evidence/evidence.entity';
import { Consignment } from './consignments/consignment.entity';
import { Trip } from './trips/trip.entity';
import { MaintenanceRecord } from './maintenance/maintenance-record.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_DATABASE', 'control_flotas'),
        entities: [User, Vehicle, Expense, Evidence, Consignment, Trip, MaintenanceRecord],
        synchronize: true,
      }),
    }),
    UsersModule,
    VehiclesModule,
    ExpensesModule,
    EvidenceModule,
    ConsignmentsModule,
    TripsModule,
    MaintenanceModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    },
  ],
})
export class AppModule { }
