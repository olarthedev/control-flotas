import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, IsOptional, Matches, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../user.entity';

export class CreateUserDto {
    @IsString({ message: 'fullName debe ser texto' })
    @IsNotEmpty({ message: 'fullName es requerido' })
    @MinLength(3, { message: 'fullName debe tener al menos 3 caracteres' })
    @MaxLength(150, { message: 'fullName no puede exceder 150 caracteres' })
    fullName: string;

    @IsEmail({}, { message: 'email debe ser un correo válido' })
    @IsNotEmpty({ message: 'email es requerido' })
    email: string;

    @IsString({ message: 'password debe ser texto' })
    @IsNotEmpty({ message: 'password es requerido' })
    @MinLength(8, { message: 'password debe tener al menos 8 caracteres' })
    @MaxLength(100, { message: 'password no puede exceder 100 caracteres' })
    password: string;

    @IsEnum(UserRole, { message: 'role debe ser: admin, driver, supervisor o accountant' })
    @IsNotEmpty({ message: 'role es requerido' })
    role: UserRole;

    @IsOptional()
    @IsString({ message: 'phone debe ser texto' })
    @Matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/, {
        message: 'phone debe ser un número válido'
    })
    phone?: string;

    @IsOptional()
    @IsString({ message: 'licenseNumber debe ser texto' })
    @MaxLength(50, { message: 'licenseNumber no puede exceder 50 caracteres' })
    licenseNumber?: string;

    @IsOptional()
    @Type(() => Number)
    @IsNumber({}, { message: 'assignedVehicleId debe ser numérico' })
    assignedVehicleId?: number;

    @IsOptional()
    @IsBoolean({ message: 'isActive debe ser un booleano' })
    isActive?: boolean;
}
