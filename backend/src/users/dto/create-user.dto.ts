export class CreateUserDto {
    fullName: string;
    email: string;
    password: string;
    role: string;
    phone?: string;
    licenseNumber?: string;
}
