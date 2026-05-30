import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    ManyToOne,
} from 'typeorm';
import { Vehicle } from '../vehicles/vehicle.entity';
import { Expense } from '../expenses/expense.entity';
import { Consignment } from '../consignments/consignment.entity';
import { Trip } from '../trips/trip.entity';
import { MaintenanceRecord } from '../maintenance/maintenance-record.entity';
import { UserVehicleHistory } from './user-vehicle-history.entity';
import { UserBankAccount } from './user-bank-account.entity';
import { Exclude } from 'class-transformer';

export enum UserRole {
    ADMIN = 'admin',
    DRIVER = 'driver',
    SUPERVISOR = 'supervisor',
    ACCOUNTANT = 'accountant',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 150 })
    fullName: string;

    @Column({ length: 150, unique: true })
    email: string;

    @Column({ length: 255 })
    @Exclude()
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.DRIVER,
    })
    role: UserRole;

    @Column({ default: true })
    isActive: boolean;

    @Column({ length: 30, nullable: true })
    phone?: string;

    @Column({ length: 50, nullable: true })
    licenseNumber?: string;

    @Column({
        type: 'decimal', precision: 14, scale: 2, default: 0, transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value),
        }
    })
    monthlySalary: number;

    @ManyToOne(() => Vehicle, { nullable: true, onDelete: 'SET NULL' })
    assignedVehicle?: Vehicle | null;

    @OneToMany(() => UserVehicleHistory, (history) => history.user, {
        cascade: true,
    })
    vehicleAssignmentHistory: UserVehicleHistory[];

    @OneToMany(() => UserBankAccount, (bankAccount) => bankAccount.user, {
        cascade: true,
    })
    bankAccounts: UserBankAccount[];

    @OneToMany(() => Expense, (expense) => expense.driver)
    expenses: Expense[];

    @OneToMany(() => Consignment, (consignment) => consignment.driver)
    consignments: Consignment[];

    @OneToMany(() => Trip, (trip) => trip.driver)
    trips: Trip[];

    @OneToMany(() => MaintenanceRecord, (maintenance) => maintenance.performedBy)
    maintenanceRecords: MaintenanceRecord[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
