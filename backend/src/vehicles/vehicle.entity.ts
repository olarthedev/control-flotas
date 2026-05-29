import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { Expense } from '../expenses/expense.entity';
import { MaintenanceRecord } from '../maintenance/maintenance-record.entity';
import { Trip } from '../trips/trip.entity';
import { User } from '../users/user.entity';

@Entity('vehicles')
export class Vehicle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 20, unique: true })
    licensePlate: string;

    @Column({ length: 80 })
    brand: string;

    @Column({ length: 80 })
    model: string;

    @Column({ length: 50 })
    type: string;

    @Column({ type: 'date', nullable: true })
    soatExpiryDate: Date | null;

    @Column({ type: 'date', nullable: true })
    technicalReviewExpiryDate: Date | null;

    @Column({ type: 'date', nullable: true })
    insuranceExpiryDate: Date | null;

    @Column({
        type: 'decimal', precision: 14, scale: 2, default: 0, transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value),
        }
    })
    maintenanceSpent: number;

    @OneToMany(() => Expense, (expense) => expense.vehicle)
    expenses: Expense[];

    @OneToMany(() => MaintenanceRecord, (maintenance) => maintenance.vehicle, {
        cascade: true,
    })
    maintenanceRecords: MaintenanceRecord[];

    @OneToMany(() => Trip, (trip) => trip.vehicle, { cascade: true })
    trips: Trip[];

    @OneToMany(() => User, (user) => user.assignedVehicle)
    assignedDrivers: User[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
