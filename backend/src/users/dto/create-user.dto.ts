import { IsString, IsEmail, IsNotEmpty, MinLength, MaxLength, IsOptional, Matches, IsEnum } from 'class-validator';
import { UserRole } from '../user.entity';

export class CreateUserDto {
    @IsString({ message: 'fullName debe ser texto' })
    @IsNotEmpty({ message: 'fullName es requerido' })
    @MinLength(3, { message: 'fullName debe tener al menos 3 caracteres' })
    @MaxLength(100, { message: 'fullName no puede exceder 100 caracteres' })
    fullName: string;

    @IsEmail({}, { message: 'email debe ser un correo válido' })
    @IsNotEmpty({ message: 'email es requerido' })
    email: string;

    @IsString({ message: 'password debe ser texto' })
    @IsNotEmpty({ message: 'password es requerido' })
    @MinLength(8, { message: 'password debe tener al menos 8 caracteres' })
    @MaxLength(100, { message: 'password no puede exceder 100 caracteres' })
    password: string;

    @IsEnum(UserRole, { message: 'role debe ser un rol válido' })
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
    @MaxLength(20, { message: 'licenseNumber no puede exceder 20 caracteres' })
    licenseNumber?: string;
}
