import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
} from '@nestjs/common';
import { ConsignmentsService } from './consignments.service';
import { CreateConsignmentDto } from './dto/create-consignment.dto';
import { UpdateConsignmentDto } from './dto/update-consignment.dto';

@Controller('consignments')
export class ConsignmentsController {
    constructor(private readonly consignmentsService: ConsignmentsService) { }

    @Post()
    create(@Body() createConsignmentDto: CreateConsignmentDto) {
        return this.consignmentsService.create(createConsignmentDto);
    }

    @Get()
    findAll() {
        return this.consignmentsService.findAll();
    }

    @Get('active')
    findActive() {
        return this.consignmentsService.findActive();
    }

    @Get('driver/:driverId')
    findByDriver(@Param('driverId') driverId: string) {
        return this.consignmentsService.findByDriver(+driverId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.consignmentsService.findById(+id);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateConsignmentDto: UpdateConsignmentDto,
    ) {
        return this.consignmentsService.update(+id, updateConsignmentDto);
    }

    @Patch(':id/close')
    closeConsignment(@Param('id') id: string) {
        return this.consignmentsService.closeConsignment(+id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.consignmentsService.remove(+id);
    }
}
