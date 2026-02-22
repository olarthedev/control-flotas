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

    /** POST /trips */
    @Post()
    create(@Body() createTripDto: CreateTripDto) {
        return this.tripsService.create(createTripDto);
    }

    /** GET /trips */
    @Get()
    findAll() {
        return this.tripsService.findAll();
    }

    /** GET /trips/in-progress */
    @Get('in-progress')
    findInProgress() {
        return this.tripsService.findInProgress();
    }

    /** GET /trips/driver/:driverId */
    @Get('driver/:driverId')
    findByDriver(@Param('driverId') driverId: string) {
        return this.tripsService.findByDriver(+driverId);
    }

    /** GET /trips/vehicle/:vehicleId */
    @Get('vehicle/:vehicleId')
    findByVehicle(@Param('vehicleId') vehicleId: string) {
        return this.tripsService.findByVehicle(+vehicleId);
    }

    /** GET /trips/:id */
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.tripsService.findById(+id);
    }

    /** PATCH /trips/:id */
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto) {
        return this.tripsService.update(+id, updateTripDto);
    }

    /** PATCH /trips/:id/complete */
    @Patch(':id/complete')
    completeTrip(@Param('id') id: string) {
        return this.tripsService.completeTrip(+id);
    }

    /** DELETE /trips/:id */
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.tripsService.remove(+id);
    }
}
