import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';

@Controller('maintenance')
export class MaintenanceController {
    constructor(private readonly maintenanceService: MaintenanceService) { }

    @Post()
    create(@Body() createMaintenanceDto: CreateMaintenanceDto) {
        return this.maintenanceService.create(createMaintenanceDto);
    }

    @Get()
    findAll() {
        return this.maintenanceService.findAll();
    }

    @Get('pending')
    findPending() {
        return this.maintenanceService.findPending();
    }

    @Get('type/:type')
    findByType(@Param('type') type: string) {
        return this.maintenanceService.findByType(type);
    }

    @Get('vehicle/:vehicleId')
    findByVehicle(@Param('vehicleId') vehicleId: string) {
        return this.maintenanceService.findByVehicle(+vehicleId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.maintenanceService.findById(+id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateMaintenanceDto: UpdateMaintenanceDto,
    ) {
        return this.maintenanceService.update(+id, updateMaintenanceDto);
    }

    @Patch(':id/complete')
    completeMaintenanceRecord(@Param('id') id: string) {
        return this.maintenanceService.completeMaintenanceRecord(+id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.maintenanceService.remove(+id);
    }
}
