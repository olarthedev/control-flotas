import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceRecord, MaintenanceStatus, MaintenanceType } from './maintenance-record.entity';
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

    async create(createMaintenanceDto: CreateMaintenanceDto): Promise<MaintenanceRecord> {
        const maintenance = new MaintenanceRecord();
        maintenance.type = createMaintenanceDto.type;
        maintenance.title = createMaintenanceDto.title;
        maintenance.maintenanceDate = new Date(createMaintenanceDto.maintenanceDate);
        maintenance.cost = createMaintenanceDto.cost;
        maintenance.invoiceNumber = (createMaintenanceDto.invoiceNumber ?? null) as string | null;
        maintenance.provider = (createMaintenanceDto.provider ?? null) as string | null;
        maintenance.mileageAtMaintenance = (createMaintenanceDto.mileageAtMaintenance ?? null) as number | null;
        maintenance.requiresFollowUp = createMaintenanceDto.requiresFollowUp ?? false;

        const vehicle = await this.vehicleRepository.findOne({
            where: { id: createMaintenanceDto.vehicleId },
        });
        if (!vehicle) {
            throw new NotFoundException(`Vehicle con id ${createMaintenanceDto.vehicleId} no encontrado`);
        }
        maintenance.vehicle = vehicle;

        if (createMaintenanceDto.performedById !== undefined) {
            if (createMaintenanceDto.performedById === null) {
                maintenance.performedBy = null;
            } else {
                const user = await this.userRepository.findOne({
                    where: { id: createMaintenanceDto.performedById },
                });
                if (!user) {
                    throw new NotFoundException(`User con id ${createMaintenanceDto.performedById} no encontrado`);
                }
                maintenance.performedBy = user;
            }
        }

        return await this.maintenanceRepository.save(maintenance);
    }

    async findAll(): Promise<MaintenanceRecord[]> {
        return await this.maintenanceRepository.find({
            relations: ['vehicle', 'performedBy'],
        });
    }

    async findById(id: number): Promise<MaintenanceRecord | null> {
        return await this.maintenanceRepository.findOne({
            where: { id },
            relations: ['vehicle', 'performedBy'],
        });
    }

    async findByVehicle(vehicleId: number): Promise<MaintenanceRecord[]> {
        return await this.maintenanceRepository.find({
            where: { vehicle: { id: vehicleId } },
            relations: ['vehicle', 'performedBy'],
            order: { maintenanceDate: 'DESC' },
        });
    }

    async findPending(): Promise<MaintenanceRecord[]> {
        return await this.maintenanceRepository.find({
            where: { status: MaintenanceStatus.SCHEDULED },
            relations: ['vehicle', 'performedBy'],
        });
    }

    async findByType(type: string): Promise<MaintenanceRecord[]> {
        return await this.maintenanceRepository.find({
            where: { type: type as MaintenanceType },
            relations: ['vehicle', 'performedBy'],
            order: { maintenanceDate: 'DESC' },
        });
    }

    async update(id: number, updateMaintenanceDto: UpdateMaintenanceDto): Promise<MaintenanceRecord> {
        const existing = await this.findById(id);
        if (!existing) {
            throw new NotFoundException('Maintenance record not found');
        }

        if (updateMaintenanceDto.type !== undefined) existing.type = updateMaintenanceDto.type;
        if (updateMaintenanceDto.title !== undefined) existing.title = updateMaintenanceDto.title;
        if (updateMaintenanceDto.maintenanceDate !== undefined) existing.maintenanceDate = new Date(updateMaintenanceDto.maintenanceDate);
        if (updateMaintenanceDto.cost !== undefined) existing.cost = updateMaintenanceDto.cost;
        if (updateMaintenanceDto.invoiceNumber !== undefined) existing.invoiceNumber = updateMaintenanceDto.invoiceNumber ?? null;
        if (updateMaintenanceDto.provider !== undefined) existing.provider = updateMaintenanceDto.provider ?? null;
        if (updateMaintenanceDto.mileageAtMaintenance !== undefined) existing.mileageAtMaintenance = updateMaintenanceDto.mileageAtMaintenance ?? null;
        if (updateMaintenanceDto.status !== undefined) existing.status = updateMaintenanceDto.status;
        if (updateMaintenanceDto.requiresFollowUp !== undefined) existing.requiresFollowUp = updateMaintenanceDto.requiresFollowUp;

        if (updateMaintenanceDto.performedById !== undefined) {
            if (updateMaintenanceDto.performedById === null) {
                existing.performedBy = null;
            } else {
                const user = await this.userRepository.findOne({
                    where: { id: updateMaintenanceDto.performedById },
                });
                if (!user) {
                    throw new NotFoundException(`User con id ${updateMaintenanceDto.performedById} no encontrado`);
                }
                existing.performedBy = user;
            }
        }

        await this.maintenanceRepository.save(existing);
        return this.findById(id) as Promise<MaintenanceRecord>;
    }

    async remove(id: number) {
        const result = await this.maintenanceRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('Maintenance record not found');
        }
        return result;
    }

    async completeMaintenanceRecord(id: number) {
        return await this.update(id, { status: MaintenanceStatus.COMPLETED });
    }
}
