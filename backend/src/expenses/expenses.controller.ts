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

@Controller('expenses')
@UseInterceptors(ClassSerializerInterceptor)
export class ExpensesController {
    constructor(private readonly expensesService: ExpensesService) { }

    /** POST /expenses */
    @Post()
    create(@Body() createExpenseDto: CreateExpenseDto) {
        return this.expensesService.create(createExpenseDto);
    }

    /** GET /expenses */
    @Get()
    findAll() {
        return this.expensesService.findAll();
    }

    /** GET /expenses/pending */
    @Get('pending')
    findPending() {
        return this.expensesService.findPendingExpenses();
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
    findByVehicle(@Param('vehicleId') vehicleId: string) {
        return this.expensesService.findByVehicle(+vehicleId);
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
