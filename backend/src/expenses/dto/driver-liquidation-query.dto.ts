import { IsDateString, IsNotEmpty } from 'class-validator';

export class DriverLiquidationQueryDto {
    @IsDateString({}, { message: 'dateFrom debe ser una fecha ISO válida' })
    @IsNotEmpty({ message: 'dateFrom es requerido' })
    dateFrom: string;

    @IsDateString({}, { message: 'dateTo debe ser una fecha ISO válida' })
    @IsNotEmpty({ message: 'dateTo es requerido' })
    dateTo: string;
}
