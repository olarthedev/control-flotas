import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from 'typeorm';
import { Vehicle } from '../vehicles/vehicle.entity';
import { User } from '../users/user.entity';

export enum MaintenanceType {
    PREVENTIVE = 'PREVENTIVE',
    CORRECTIVE = 'CORRECTIVE',
    EMERGENCY = 'EMERGENCY',
    INSPECTION = 'INSPECTION',
}

export enum MaintenanceStatus {
    COMPLETED = 'COMPLETED',
    PENDING = 'PENDING',
    SCHEDULED = 'SCHEDULED',
}

@Entity('maintenance_records')
export class MaintenanceRecord {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: 'enum',
        enum: MaintenanceType,
    })
    type: MaintenanceType;

    @Column()
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'timestamp' })
    maintenanceDate: Date;

    @Column({
        type: 'decimal',
        precision: 12,
        scale: 2,
        transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value),
        },
    })
    cost: number;

    @Column({ type: 'text', nullable: true })
    invoiceNumber: string | null;

    @Column({ type: 'text', nullable: true })
    provider: string | null;

    @Column({
        name: 'mileage',
        type: 'decimal',
        precision: 12,
        scale: 2,
        nullable: true,
        transformer: {
            to: (value: number | null) => value,
            from: (value: string | null) => (value === null ? null : parseFloat(value)),
        },
    })
    mileageAtMaintenance: number | null;

    @Column({
        type: 'decimal',
        precision: 12,
        scale: 2,
        nullable: true,
        transformer: {
            to: (value: number | null) => value,
            from: (value: string | null) => (value === null ? null : parseFloat(value)),
        },
    })
    nextMaintenanceMileage: number | null;

    @Column({ type: 'timestamp', nullable: true })
    nextMaintenanceDate: Date | null;

    @Column({ type: 'text', nullable: true })
    technicalNotes: string | null;

    @Column({
        type: 'enum',
        enum: MaintenanceStatus,
        default: MaintenanceStatus.COMPLETED,
    })
    status: MaintenanceStatus;

    @Column({ default: false })
    requiresFollowUp: boolean;

    @Column({ type: 'text', nullable: true })
    followUpNotes: string | null;

    @ManyToOne(() => Vehicle, (vehicle) => vehicle.maintenanceRecords, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    vehicle: Vehicle;

    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
    performedBy: User | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
