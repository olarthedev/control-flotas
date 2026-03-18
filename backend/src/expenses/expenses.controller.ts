import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Query,
    UseInterceptors,
} from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { FindExpensesQueryDto } from './dto/find-expenses-query.dto';
import { FindExpensesByVehicleQueryDto } from './dto/find-expenses-by-vehicle-query.dto';

@Controller('expenses')
@UseInterceptors(ClassSerializerInterceptor)
export class ExpensesController {
    constructor(private readonly expensesService: ExpensesService) { }

    /** POST /expenses */
    @Post()
    create(@Body() createExpenseDto: CreateExpenseDto) {
        return this.expensesService.create(createExpenseDto);
    }

    /** GET /expenses — supports ?page, ?limit, ?status, ?dateFrom, ?dateTo, ?vehicleId, ?driverId */
    @Get()
    findAll(@Query() query: FindExpensesQueryDto) {
        return this.expensesService.findAll(query);
    }

    /** GET /expenses/pending */
    @Get('pending')
    findPending() {
        return this.expensesService.findPendingExpenses();
    }

    /** GET /expenses/summary/by-vehicle */
    @Get('summary/by-vehicle')
    summaryByVehicle() {
        return this.expensesService.summaryByVehicle();
    }

    /** GET /expenses/without-evidence */
    @Get('without-evidence')
    findWithoutEvidence() {
        return this.expensesService.findExpensesWithoutEvidence();
    }

    /** GET /expenses/driver/:driverId */
    @Get('driver/:driverId')
    findByDriver(@Param('driverId') driverId: string) {
        return this.expensesService.findByDriver(+driverId);
    }

    /** GET /expenses/trip/:tripId */
    @Get('trip/:tripId')
    findByTrip(@Param('tripId') tripId: string) {
        return this.expensesService.findByTrip(+tripId);
    }

    /** GET /expenses/vehicle/:vehicleId */
    @Get('vehicle/:vehicleId')
    findByVehicle(
        @Param('vehicleId') vehicleId: string,
        @Query() query: FindExpensesByVehicleQueryDto,
    ) {
        return this.expensesService.findByVehicle(+vehicleId, query);
    }

    /** GET /expenses/:id */
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.expensesService.findById(+id);
    }

    /** PATCH /expenses/:id */
    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateExpenseDto: UpdateExpenseDto,
    ) {
        return this.expensesService.update(+id, updateExpenseDto);
    }

    /** DELETE /expenses/:id */
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.expensesService.remove(+id);
    }
}
