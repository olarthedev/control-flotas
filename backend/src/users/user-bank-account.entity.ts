import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { User } from './user.entity';

@Entity('user_bank_accounts')
export class UserBankAccount {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.bankAccounts, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column()
    bankName: string;

    @Column()
    accountType: string;

    @Column({ type: 'text' })
    @Exclude()
    accountNumberEncrypted: string;

    @Expose()
    accountNumber?: string;

    @CreateDateColumn()
    createdAt: Date;
}
