import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceRecord } from './maintenance-record.entity';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { Vehicle } from '../vehicles/vehicle.entity';
import { User } from '../users/user.entity';

@Injectable()
export class MaintenanceService {
    constructor(
        @InjectRepository(MaintenanceRecord)
        private maintenanceRepository: Repository<MaintenanceRecord>,
        @InjectRepository(Vehicle)
        private vehicleRepository: Repository<Vehicle>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async create(createMaintenanceDto: CreateMaintenanceDto) {
        const maintenance = new MaintenanceRecord();
        maintenance.type = createMaintenanceDto.type;
        maintenance.title = createMaintenanceDto.title;
        maintenance.description = createMaintenanceDto.description;
        maintenance.maintenanceDate = new Date(createMaintenanceDto.maintenanceDate);
        maintenance.cost = createMaintenanceDto.cost;
        maintenance.invoiceNumber = (createMaintenanceDto.invoiceNumber ?? null) as string | null;
        maintenance.provider = (createMaintenanceDto.provider ?? null) as string | null;
        maintenance.mileageAtMaintenance = (createMaintenanceDto.mileageAtMaintenance ?? null) as number | null;
        maintenance.nextMaintenanceMileage = (createMaintenanceDto.nextMaintenanceMileage ?? null) as number | null;
        maintenance.nextMaintenanceDate = (createMaintenanceDto.nextMaintenanceDate ?? null) as Date | null;
        maintenance.technicalNotes = (createMaintenanceDto.technicalNotes ?? null) as string | null;

        // Resolver relación de vehicle
        if (createMaintenanceDto.vehicleId) {
            const vehicle = await this.vehicleRepository.findOne({
                where: { id: createMaintenanceDto.vehicleId },
            });
            if (!vehicle) {
                throw new Error(`Vehicle con id ${createMaintenanceDto.vehicleId} no encontrado`);
            }
            maintenance.vehicle = vehicle;
        }

        return await this.maintenanceRepository.save(maintenance);
    }

    async findAll() {
        return await this.maintenanceRepository.find({
            relations: ['vehicle', 'performedBy'],
        });
    }

    async findById(id: number) {
        return await this.maintenanceRepository.findOne({
            where: { id },
            relations: ['vehicle', 'performedBy'],
        });
    }

    async findByVehicle(vehicleId: number) {
        return await this.maintenanceRepository.find({
            where: { vehicle: { id: vehicleId } },
            relations: ['vehicle', 'performedBy'],
            order: { maintenanceDate: 'DESC' },
        });
    }

    async findPending() {
        return await this.maintenanceRepository.find({
            where: { status: 'PENDING' },
            relations: ['vehicle', 'performedBy'],
        });
    }

    async findByType(type: string) {
        return await this.maintenanceRepository.find({
            where: { type: type as any },
            relations: ['vehicle', 'performedBy'],
            order: { maintenanceDate: 'DESC' },
        });
    }

    async update(id: number, updateMaintenanceDto: UpdateMaintenanceDto) {
        await this.maintenanceRepository.update(id, updateMaintenanceDto as any);
        return this.findById(id);
    }

    async remove(id: number) {
        return await this.maintenanceRepository.delete(id);
    }

    async completeMaintenanceRecord(id: number) {
        return await this.update(id, { status: 'COMPLETED' } as any);
    }
}
