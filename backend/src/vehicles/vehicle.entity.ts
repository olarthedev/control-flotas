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

@Entity('vehicles')
export class Vehicle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    licensePlate: string;

    @Column()
    brand: string;

    @Column()
    model: string;

    @Column()
    type: string;

    @Column({ type: 'date', nullable: true })
    soatExpiryDate: Date;

    @Column({ type: 'date', nullable: true })
    technicalReviewExpiryDate: Date;

    @Column({ type: 'date', nullable: true })
    insuranceExpiryDate: Date;

    // ================== ALERTAS Y SEGUIMIENTO ==================
    @Column({ default: false })
    soatAboutToExpire: boolean;

    @Column({ default: false })
    technicalReviewAboutToExpire: boolean;

    @Column({ default: false })
    insuranceAboutToExpire: boolean;

    @Column({ type: 'text', nullable: true })
    documentNotes: string;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    maintenanceSpent: number;

    @OneToMany(() => Expense, (expense) => expense.vehicle, {
        cascade: true,
    })
    expenses: Expense[];

    @OneToMany(() => MaintenanceRecord, (maintenance) => maintenance.vehicle, {
        cascade: true,
    })
    maintenanceRecords: MaintenanceRecord[];

    @OneToMany(() => Trip, (trip) => trip.vehicle, { cascade: true })
    trips: Trip[];

    // ================== AUDITORÍA ==================
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
