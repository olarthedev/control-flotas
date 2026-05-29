import {
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    Delete,
} from '@nestjs/common';
import { BankAccountsService } from './bank-accounts.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

@Controller('users/:userId/bank-accounts')
export class BankAccountsController {
    constructor(private readonly bankAccountsService: BankAccountsService) { }

    @Post()
    create(
        @Param('userId') userId: string,
        @Body() createBankAccountDto: CreateBankAccountDto,
    ) {
        createBankAccountDto.userId = Number(userId);
        return this.bankAccountsService.create(createBankAccountDto);
    }

    @Get()
    findByUser(@Param('userId') userId: string) {
        return this.bankAccountsService.findByUser(Number(userId));
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.bankAccountsService.findById(Number(id));
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateBankAccountDto: UpdateBankAccountDto,
    ) {
        return this.bankAccountsService.update(Number(id), updateBankAccountDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.bankAccountsService.remove(Number(id));
    }
}
