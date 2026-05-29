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
import { Expense } from '../expenses/expense.entity';
import { Consignment } from '../consignments/consignment.entity';

export enum TripStatus {
    PLANNED = 'planned',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
}

@Entity('trips')
export class Trip {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 50, unique: true })
    tripNumber: string;

    @Column({ type: 'timestamp', nullable: true })
    startDate: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    endDate: Date | null;

    @Column({ type: 'text' })
    origin: string;

    @Column({ type: 'text' })
    destination: string;

    @Column({
        type: 'enum',
        enum: TripStatus,
        default: TripStatus.PLANNED,
    })
    status: TripStatus;

    @Column({
        type: 'decimal', precision: 14, scale: 2, nullable: true, transformer: {
            to: (value: number) => value,
            from: (value: string) => value ? parseFloat(value) : null,
        }
    })
    plannedBudget: number | null;

    @Column({
        type: 'decimal', precision: 12, scale: 2, nullable: true, transformer: {
            to: (value: number) => value,
            from: (value: string) => value ? parseFloat(value) : null,
        }
    })
    startMileage: number | null;

    @Column({
        type: 'decimal', precision: 12, scale: 2, nullable: true, transformer: {
            to: (value: number) => value,
            from: (value: string) => value ? parseFloat(value) : null,
        }
    })
    endMileage: number | null;

    @ManyToOne(() => User, { nullable: false, onDelete: 'RESTRICT' })
    driver: User;

    @ManyToOne(() => Vehicle, (vehicle) => vehicle.trips, {
        nullable: false,
        onDelete: 'RESTRICT',
    })
    vehicle: Vehicle;

    @OneToMany(() => Expense, (expense) => expense.trip)
    expenses: Expense[];

    @OneToMany(() => Consignment, (consignment) => consignment.trip)
    consignments: Consignment[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
