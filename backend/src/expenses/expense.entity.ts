import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { Trip } from '../trips/trip.entity';
import { Evidence } from '../evidence/evidence.entity';
import { Consignment } from '../consignments/consignment.entity';

export enum ExpenseType {
    FUEL = 'fuel',
    TOLL = 'toll',
    MAINTENANCE = 'maintenance',
    FOOD = 'food',
    LODGING = 'lodging',
    PARKING = 'parking',
    OTHER = 'other',
}

export enum ExpenseStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
}

@Entity('expenses')
export class Expense {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: ExpenseType,
    })
    type: ExpenseType;

    @Column({
        type: 'decimal', precision: 14, scale: 2, transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value),
        }
    })
    amount: number;

    @Column({ type: 'timestamp', default: () => 'NOW()' })
    expenseDate: Date;

    @Column({ type: 'text', nullable: true })
    description: string | null;

    @Column({
        type: 'enum',
        enum: ExpenseStatus,
        default: ExpenseStatus.PENDING,
    })
    status: ExpenseStatus;

    @Column({ default: false })
    hasEvidence: boolean;

    @Column({ type: 'text', nullable: true })
    rejectionReason: string | null;

    @Column({ type: 'timestamp', nullable: true })
    validatedAt: Date | null;

    @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
    driver: User;

    @ManyToOne(() => Vehicle, (vehicle) => vehicle.expenses, {
        nullable: false,
        onDelete: 'RESTRICT',
    })
    vehicle: Vehicle;

    @ManyToOne(() => Trip, (trip) => trip.expenses, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    trip: Trip | null;

    @ManyToOne(() => Consignment, (consignment) => consignment.expenses, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    consignment: Consignment | null;

    @ManyToOne(() => User, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    @JoinColumn({ name: 'validated_by' })
    validatedBy: User | null;

    @OneToMany(() => Evidence, (evidence) => evidence.expense, {
        cascade: true,
        eager: true,
    })
    evidence: Evidence[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
