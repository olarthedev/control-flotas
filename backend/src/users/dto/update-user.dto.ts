import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsBoolean, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsOptional()
    @IsBoolean({ message: 'isActive debe ser un booleano' })
    isActive?: boolean;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'assignedVehicleId debe ser numérico' })
    assignedVehicleId?: number;
}
