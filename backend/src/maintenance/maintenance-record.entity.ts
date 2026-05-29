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
    PREVENTIVE = 'preventive',
    CORRECTIVE = 'corrective',
    EMERGENCY = 'emergency',
}

export enum MaintenanceStatus {
    SCHEDULED = 'scheduled',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
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

    @Column({ length: 200 })
    title: string;

    @Column({ type: 'timestamp', default: () => 'NOW()' })
    maintenanceDate: Date;

    @Column({
        type: 'decimal', precision: 14, scale: 2, default: 0, transformer: {
            to: (value: number) => value,
            from: (value: string) => parseFloat(value),
        }
    })
    cost: number;

    @Column({ type: 'varchar', length: 100, nullable: true })
    invoiceNumber: string | null;

    @Column({ type: 'varchar', length: 150, nullable: true })
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
        type: 'enum',
        enum: MaintenanceStatus,
        default: MaintenanceStatus.SCHEDULED,
    })
    status: MaintenanceStatus;

    @Column({ default: false })
    requiresFollowUp: boolean;

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
