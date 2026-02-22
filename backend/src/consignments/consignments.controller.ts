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
import { ConsignmentsService } from './consignments.service';
import { CreateConsignmentDto } from './dto/create-consignment.dto';
import { UpdateConsignmentDto } from './dto/update-consignment.dto';

@Controller('consignments')
@UseInterceptors(ClassSerializerInterceptor)
export class ConsignmentsController {
    constructor(private readonly consignmentsService: ConsignmentsService) { }

    /** POST /consignments */
    @Post()
    create(@Body() createConsignmentDto: CreateConsignmentDto) {
        return this.consignmentsService.create(createConsignmentDto);
    }

    /** GET /consignments */
    @Get()
    findAll() {
        return this.consignmentsService.findAll();
    }

    /** GET /consignments/active */
    @Get('active')
    findActive() {
        return this.consignmentsService.findActive();
    }

    /** GET /consignments/driver/:driverId */
    @Get('driver/:driverId')
    findByDriver(@Param('driverId') driverId: string) {
        return this.consignmentsService.findByDriver(+driverId);
    }

    /** GET /consignments/:id */
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.consignmentsService.findById(+id);
    }

    /** PATCH /consignments/:id */
    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateConsignmentDto: UpdateConsignmentDto,
    ) {
        return this.consignmentsService.update(+id, updateConsignmentDto);
    }

    /** PATCH /consignments/:id/close */
    @Patch(':id/close')
    closeConsignment(@Param('id') id: string) {
        return this.consignmentsService.closeConsignment(+id);
    }

    /** DELETE /consignments/:id */
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.consignmentsService.remove(+id);
    }
}
