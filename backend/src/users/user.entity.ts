import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Vehicle } from '../vehicles/vehicle.entity';
import { Expense } from '../expenses/expense.entity';
import { Consignment } from '../consignments/consignment.entity';
import { Trip } from '../trips/trip.entity';
import { MaintenanceRecord } from '../maintenance/maintenance-record.entity';

export enum UserRole {
    ADMIN = 'ADMIN',
    DRIVER = 'DRIVER',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fullName: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.DRIVER,
    })
    role: UserRole;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'text', nullable: true })
    phone?: string;

    @Column({ type: 'text', nullable: true })
    licenseNumber?: string; // Número de licencia (para conductores)

    // ================== RELACIONES ==================
    @OneToMany(() => Vehicle, (vehicle) => vehicle.driver)
    vehiclesAssigned: Vehicle[];

    @OneToMany(() => Expense, (expense) => expense.driver)
    expenses: Expense[];

    @OneToMany(() => Consignment, (consignment) => consignment.driver)
    consignments: Consignment[];

    @OneToMany(() => Trip, (trip) => trip.driver)
    trips: Trip[];

    @OneToMany(() => MaintenanceRecord, (maintenance) => maintenance.performedBy)
    maintenanceRecords: MaintenanceRecord[];

    // ================== AUDITORÍA ==================
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
