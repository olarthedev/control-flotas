import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
} from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Controller('vehicles')
@UseInterceptors(ClassSerializerInterceptor)
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) { }

  /** POST /vehicles */
  @Post()
  create(@Body() createVehicleDto: CreateVehicleDto) {
    return this.vehiclesService.create(createVehicleDto);
  }

  /** GET /vehicles */
  @Get()
  findAll() {
    return this.vehiclesService.findAll();
  }

  /** GET /vehicles/active */
  @Get('active')
  findActive() {
    return this.vehiclesService.findActive();
  }

  /** GET /vehicles/expired-documents */
  @Get('expired-documents')
  findWithExpiredDocuments() {
    return this.vehiclesService.findWithExpiredDocuments();
  }

  /** GET /vehicles/plate/:licensePlate */
  @Get('plate/:licensePlate')
  findByLicensePlate(@Param('licensePlate') licensePlate: string) {
    return this.vehiclesService.findByLicensePlate(licensePlate);
  }

  /** GET /vehicles/:id */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findById(+id);
  }

  /** PATCH /vehicles/:id */
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(+id, updateVehicleDto);
  }

  /** PATCH /vehicles/:id/toggle-active */
  @Patch(':id/toggle-active')
  toggleActive(@Param('id') id: string) {
    return this.vehiclesService.toggleActive(+id);
  }

  /** DELETE /vehicles/:id */
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.vehiclesService.remove(+id);
  }
}
