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
import { Exclude } from 'class-transformer';

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

    @Column({ type: 'text', nullable: true })
    phone?: string;

    @Column({ type: 'text', nullable: true })
    licenseNumber?: string; // Número de licencia (para conductores)

    @Column({
        type: 'decimal', precision: 12, scale: 2, default: 0, transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value)
        }
    })
    monthlySalary: number;

    @ManyToOne(() => Vehicle, { nullable: true, onDelete: 'SET NULL' })
    assignedVehicle?: Vehicle | null;

    // ================== RELACIONES ==================
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
