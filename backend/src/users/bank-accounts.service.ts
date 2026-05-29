import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { UserBankAccount } from './user-bank-account.entity';
import { User } from './user.entity';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';

@Injectable()
export class BankAccountsService {
    constructor(
        @InjectRepository(UserBankAccount)
        private readonly bankAccountRepository: Repository<UserBankAccount>,
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        private readonly configService: ConfigService,
    ) { }

    private getEncryptionKey(): Buffer {
        const rawSecret = this.configService.get<string>('BANK_ACCOUNT_ENCRYPTION_KEY');
        if (!rawSecret) {
            throw new Error('BANK_ACCOUNT_ENCRYPTION_KEY must be configured to manage bank accounts');
        }
        return createHash('sha256').update(rawSecret, 'utf8').digest();
    }

    private encryptAccountNumber(accountNumber: string): string {
        const iv = randomBytes(12);
        const cipher = createCipheriv('aes-256-gcm', this.getEncryptionKey(), iv);
        const encrypted = Buffer.concat([cipher.update(accountNumber, 'utf8'), cipher.final()]);
        const authTag = cipher.getAuthTag();
        return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
    }

    private decryptAccountNumber(payload: string): string {
        const [ivBase64, authTagBase64, dataBase64] = payload.split(':');
        if (!ivBase64 || !authTagBase64 || !dataBase64) {
            throw new BadRequestException('Encrypted account payload is malformed');
        }
        const iv = Buffer.from(ivBase64, 'base64');
        const authTag = Buffer.from(authTagBase64, 'base64');
        const encryptedData = Buffer.from(dataBase64, 'base64');
        const decipher = createDecipheriv('aes-256-gcm', this.getEncryptionKey(), iv);
        decipher.setAuthTag(authTag);
        return Buffer.concat([decipher.update(encryptedData), decipher.final()]).toString('utf8');
    }

    private async mapAccount(entity: UserBankAccount): Promise<UserBankAccount> {
        if (entity.accountNumberEncrypted) {
            entity.accountNumber = this.decryptAccountNumber(entity.accountNumberEncrypted);
        }
        return entity;
    }

    async create(createBankAccountDto: CreateBankAccountDto): Promise<UserBankAccount> {
        const user = await this.usersRepository.findOne({ where: { id: createBankAccountDto.userId } });
        if (!user) {
            throw new NotFoundException(`User con id ${createBankAccountDto.userId} no encontrado`);
        }

        const bankAccount = this.bankAccountRepository.create({
            user,
            bankName: createBankAccountDto.bankName.trim(),
            accountType: createBankAccountDto.accountType.trim(),
            accountNumberEncrypted: this.encryptAccountNumber(createBankAccountDto.accountNumber.trim()),
        });

        return this.mapAccount(await this.bankAccountRepository.save(bankAccount));
    }

    async findAll(): Promise<UserBankAccount[]> {
        const accounts = await this.bankAccountRepository.find({ relations: ['user'] });
        return Promise.all(accounts.map((account) => this.mapAccount(account)));
    }

    async findById(id: number): Promise<UserBankAccount | null> {
        const account = await this.bankAccountRepository.findOne({ where: { id }, relations: ['user'] });
        return account ? this.mapAccount(account) : null;
    }

    async findByUser(userId: number): Promise<UserBankAccount[]> {
        const accounts = await this.bankAccountRepository.find({ where: { user: { id: userId } }, relations: ['user'] });
        return Promise.all(accounts.map((account) => this.mapAccount(account)));
    }

    async update(id: number, updateBankAccountDto: UpdateBankAccountDto): Promise<UserBankAccount> {
        const account = await this.findById(id);
        if (!account) {
            throw new NotFoundException('Bank account not found');
        }

        if (updateBankAccountDto.bankName !== undefined) {
            account.bankName = updateBankAccountDto.bankName.trim();
        }
        if (updateBankAccountDto.accountType !== undefined) {
            account.accountType = updateBankAccountDto.accountType.trim();
        }
        if (updateBankAccountDto.accountNumber !== undefined) {
            account.accountNumberEncrypted = this.encryptAccountNumber(updateBankAccountDto.accountNumber.trim());
        }

        return this.mapAccount(await this.bankAccountRepository.save(account));
    }

    async remove(id: number) {
        const result = await this.bankAccountRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('Bank account not found');
        }
        return result;
    }
}
