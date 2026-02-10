import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  @Get()
  findAll() {
    return this.vehiclesService.findAll();
  }

  @Get('active')
  findActive() {
    return this.vehiclesService.findActive();
  }

  @Get('expired-documents')
  findWithExpiredDocuments() {
    return this.vehiclesService.findWithExpiredDocuments();
  }

  @Get('plate/:licensePlate')
  findByLicensePlate(@Param('licensePlate') licensePlate: string) {
    return this.vehiclesService.findByLicensePlate(licensePlate);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findById(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(+id, updateVehicleDto);
  }

  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.vehiclesService.toggleActive(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(+id);
  }
}
