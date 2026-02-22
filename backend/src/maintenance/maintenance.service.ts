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

    /**
     * Create a maintenance record; the vehicle relationship is required.
     * Throws NotFoundException if the vehicle id is invalid.
     */
    async create(createMaintenanceDto: CreateMaintenanceDto): Promise<MaintenanceRecord> {
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
                throw new (require('@nestjs/common').NotFoundException)(
                    `Vehicle con id ${createMaintenanceDto.vehicleId} no encontrado`,
                );
            }
            maintenance.vehicle = vehicle;
        }

        return await this.maintenanceRepository.save(maintenance);
    }

    /** Get every maintenance record with relations. */
    async findAll(): Promise<MaintenanceRecord[]> {
        return await this.maintenanceRepository.find({
            relations: ['vehicle', 'performedBy'],
        });
    }

    /** Find record by id. */
    async findById(id: number): Promise<MaintenanceRecord | null> {
        return await this.maintenanceRepository.findOne({
            where: { id },
            relations: ['vehicle', 'performedBy'],
        });
    }

    /** Records for a specific vehicle. */
    async findByVehicle(vehicleId: number): Promise<MaintenanceRecord[]> {
        return await this.maintenanceRepository.find({
            where: { vehicle: { id: vehicleId } },
            relations: ['vehicle', 'performedBy'],
            order: { maintenanceDate: 'DESC' },
        });
    }

    /** Records that are still pending. */
    async findPending(): Promise<MaintenanceRecord[]> {
        return await this.maintenanceRepository.find({
            where: { status: 'PENDING' },
            relations: ['vehicle', 'performedBy'],
        });
    }

    /** Filter by maintenance type. */
    async findByType(type: string): Promise<MaintenanceRecord[]> {
        return await this.maintenanceRepository.find({
            where: { type: type as any },
            relations: ['vehicle', 'performedBy'],
            order: { maintenanceDate: 'DESC' },
        });
    }

    /** Update a maintenance record; throws if not found. */
    async update(id: number, updateMaintenanceDto: UpdateMaintenanceDto): Promise<MaintenanceRecord> {
        const existing = await this.findById(id);
        if (!existing) {
            throw new (require('@nestjs/common').NotFoundException)('Maintenance record not found');
        }
        await this.maintenanceRepository.update(id, updateMaintenanceDto as any);
        return this.findById(id) as Promise<MaintenanceRecord>;
    }

    /** Delete record by id. */
    async remove(id: number) {
        const result = await this.maintenanceRepository.delete(id);
        if (result.affected === 0) {
            throw new (require('@nestjs/common').NotFoundException)('Maintenance record not found');
        }
        return result;
    }

    /** Mark a maintenance record as completed. */
    async completeMaintenanceRecord(id: number) {
        return await this.update(id, { status: 'COMPLETED' } as any);
    }
}