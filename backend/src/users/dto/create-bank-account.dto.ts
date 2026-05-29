import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBankAccountDto {
    @Transform(({ value }) => parseInt(value, 10))
    @IsNumber({}, { message: 'userId debe ser un número' })
    @IsNotEmpty({ message: 'userId es requerido' })
    userId: number;

    @IsString({ message: 'bankName debe ser texto' })
    @IsNotEmpty({ message: 'bankName es requerido' })
    bankName: string;

    @IsString({ message: 'accountType debe ser texto' })
    @IsNotEmpty({ message: 'accountType es requerido' })
    accountType: string;

    @IsString({ message: 'accountNumber debe ser texto' })
    @IsNotEmpty({ message: 'accountNumber es requerido' })
    accountNumber: string;
}
