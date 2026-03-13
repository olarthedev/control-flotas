import { IsOptional, IsNumber, Min, IsEnum, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ExpenseStatus } from '../expense.entity';

export class FindExpensesQueryDto {
    @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ description: 'Items per page', default: 20 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    limit?: number = 20;

    @ApiPropertyOptional({ enum: ExpenseStatus, description: 'Filter by status' })
    @IsOptional()
    @IsEnum(ExpenseStatus)
    status?: ExpenseStatus;

    @ApiPropertyOptional({ description: 'Filter expenses from this date (ISO 8601)' })
    @IsOptional()
    @IsDateString()
    dateFrom?: string;

    @ApiPropertyOptional({ description: 'Filter expenses up to this date (ISO 8601)' })
    @IsOptional()
    @IsDateString()
    dateTo?: string;

    @ApiPropertyOptional({ description: 'Filter by vehicle ID' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    vehicleId?: number;

    @ApiPropertyOptional({ description: 'Filter by driver ID' })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    driverId?: number;
}
