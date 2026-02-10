import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceRecord } from './maintenance-record.entity';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';

@Injectable()
export class MaintenanceService {
    constructor(
        @InjectRepository(MaintenanceRecord)
        private maintenanceRepository: Repository<MaintenanceRecord>,
    ) { }

    async create(createMaintenanceDto: CreateMaintenanceDto) {
        const maintenance = this.maintenanceRepository.create(
            createMaintenanceDto as any,
        );
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
            where: { status: 'PENDING' as any },
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
        return await this.update(id, { status: 'COMPLETED' });
    }
}
