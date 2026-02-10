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
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@Controller('trips')
@UseInterceptors(ClassSerializerInterceptor)
export class TripsController {
    constructor(private readonly tripsService: TripsService) { }

    @Post()
    create(@Body() createTripDto: CreateTripDto) {
        return this.tripsService.create(createTripDto);
    }

    @Get()
    findAll() {
        return this.tripsService.findAll();
    }

    @Get('in-progress')
    findInProgress() {
        return this.tripsService.findInProgress();
    }

    @Get('driver/:driverId')
    findByDriver(@Param('driverId') driverId: string) {
        return this.tripsService.findByDriver(+driverId);
    }

    @Get('vehicle/:vehicleId')
    findByVehicle(@Param('vehicleId') vehicleId: string) {
        return this.tripsService.findByVehicle(+vehicleId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tripsService.findById(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto) {
        return this.tripsService.update(+id, updateTripDto);
    }

    @Patch(':id/complete')
    completeTrip(@Param('id') id: string) {
        return this.tripsService.completeTrip(+id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.tripsService.remove(+id);
    }
}
