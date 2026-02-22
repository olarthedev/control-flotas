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
import { EvidenceService } from './evidence.service';
import { CreateEvidenceDto } from './dto/create-evidence.dto';
import { UpdateEvidenceDto } from './dto/update-evidence.dto';

@Controller('evidence')
@UseInterceptors(ClassSerializerInterceptor)
export class EvidenceController {
    constructor(private readonly evidenceService: EvidenceService) { }

    /** POST /evidence */
    @Post()
    create(@Body() createEvidenceDto: CreateEvidenceDto) {
        return this.evidenceService.create(createEvidenceDto);
    }

    /** GET /evidence */
    @Get()
    findAll() {
        return this.evidenceService.findAll();
    }

    /** GET /evidence/invalid */
    @Get('invalid')
    findInvalid() {
        return this.evidenceService.findInvalid();
    }

    /** GET /evidence/expense/:expenseId */
    @Get('expense/:expenseId')
    findByExpense(@Param('expenseId') expenseId: string) {
        return this.evidenceService.findByExpense(+expenseId);
    }

    /** GET /evidence/:id */
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.evidenceService.findById(+id);
    }

    /** PATCH /evidence/:id */
    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateEvidenceDto: UpdateEvidenceDto,
    ) {
        return this.evidenceService.update(+id, updateEvidenceDto);
    }

    /** DELETE /evidence/:id */
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.evidenceService.remove(+id);
    }
}
