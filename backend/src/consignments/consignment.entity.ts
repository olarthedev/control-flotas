import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Vehicle } from '../vehicles/vehicle.entity';
import { Trip } from '../trips/trip.entity';
import { Expense } from '../expenses/expense.entity';

export enum ConsignmentStatus {
    OPEN = 'open',
    CLOSED = 'closed',
    PENDING_APPROVAL = 'pending_approval',
}

export enum ConsignmentPurpose {
    TRIP_ADVANCE = 'trip_advance',
    SALARY_ADVANCE = 'salary_advance',
}

@Entity('consignments')
export class Consignment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50, unique: true })
    consignmentNumber: string;

    @Column({
        type: 'enum',
        enum: ConsignmentPurpose,
    })
    purpose: ConsignmentPurpose;

    @Column({
        type: 'decimal', precision: 14, scale: 2, default: 0, transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value),
        }
    })
    amount: number;

    @Column({ type: 'timestamp', default: () => 'NOW()' })
    consignmentDate: Date;

    @Column({
        type: 'decimal', precision: 14, scale: 2, default: 0, transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value),
        }
    })
    totalExpensesReported: number;

    @Column({
        type: 'decimal', precision: 14, scale: 2, default: 0, transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value),
        }
    })
    totalApprovedExpenses: number;

    // Columna generada por la BD: amount - total_approved_expenses
    @Column({
        type: 'decimal',
        precision: 14,
        scale: 2,
        generatedType: 'STORED',
        asExpression: 'amount - total_approved_expenses',
        insert: false,
        update: false,
        transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value),
        }
    })
    balance: number;

    @Column({
        type: 'enum',
        enum: ConsignmentStatus,
        default: ConsignmentStatus.OPEN,
    })
    status: ConsignmentStatus;

    @Column({ type: 'timestamp', nullable: true })
    closingDate: Date | null;

    @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
    driver: User;

    @ManyToOne(() => Vehicle, { nullable: true, onDelete: 'RESTRICT' })
    vehicle: Vehicle | null;

    @ManyToOne(() => Trip, (trip) => trip.consignments, {
        nullable: true,
        onDelete: 'SET NULL',
    })
    trip: Trip | null;

    @OneToMany(() => Expense, (expense) => expense.consignment)
    expenses: Expense[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
