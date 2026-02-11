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
import { Evidence } from '../evidence/evidence.entity';
import { Consignment } from '../consignments/consignment.entity';

export enum ExpenseType {
    FUEL = 'FUEL',
    TOLLS = 'TOLLS',
    MAINTENANCE = 'MAINTENANCE',
    LOADING_UNLOADING = 'LOADING_UNLOADING',
    MEALS = 'MEALS',
    PARKING = 'PARKING',
    OTHER = 'OTHER',
}

export enum ExpenseStatus {
    PENDING = 'PENDING', // Pendiente de validación
    APPROVED = 'APPROVED', // Aprobado
    OBSERVED = 'OBSERVED', // Con observaciones
    REJECTED = 'REJECTED', // Rechazado
}

@Entity('expenses')
export class Expense {
    @PrimaryGeneratedColumn()
    id: number;

    // ================== INFORMACIÓN BÁSICA ==================
    @Column({
        type: 'enum',
        enum: ExpenseType,
    })
    type: ExpenseType;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number; // Monto del gasto

    @Column({ type: 'timestamp' })
    expenseDate: Date; // Fecha/hora del gasto (automática de inicio)

    @Column({ type: 'text', nullable: true })
    description: string | null; // Descripción o concepto

    @Column({ type: 'text', nullable: true })
    notes: string | null; // Observaciones adicionales

    // ================== VALIDACIÓN Y ESTADO ==================
    @Column({
        type: 'enum',
        enum: ExpenseStatus,
        default: ExpenseStatus.PENDING,
    })
    status: ExpenseStatus;

    @Column({ default: false })
    hasEvidence: boolean; // Indica si tiene foto/recibo

    @Column({ default: false })
    isDuplicate: boolean; // Flag para gasto duplicado

    @Column({ default: false })
    isOutOfRange: boolean; // Flag para gasto fuera de rango

    @Column({ default: false })
    needsObservation: boolean; // Flag si el gasto es muy alto

    @Column({ type: 'text', nullable: true })
    rejectionReason: string | null; // Razón del rechazo

    @Column({ type: 'timestamp', nullable: true })
    validatedAt: Date | null; // Fecha de validación

    @Column({ type: 'text', nullable: true })
    validatedBy: string | null; // Usuario que validó

    // ================== RELACIONES ==================
    @ManyToOne(() => User, { nullable: false })
    driver: User; // Conductor que registró el gasto

    @ManyToOne(() => Vehicle, (vehicle) => vehicle.expenses, {
        nullable: true,
    })
    vehicle: Vehicle; // Vehículo (opcional, podría relacionarse por viaje)

    @ManyToOne(() => Trip, (trip) => trip.expenses, { nullable: true })
    trip: Trip; // Viaje en el que ocurrió el gasto

    @ManyToOne(() => Consignment, (consignment) => consignment.expenses, {
        nullable: true,
    })
    consignment: Consignment; // Consignación a la que pertenece el gasto

    @OneToMany(() => Evidence, (evidence) => evidence.expense, {
        cascade: true,
        eager: true,
    })
    evidence: Evidence[]; // Fotos/recibos del gasto

    // ================== AUDITORÍA ==================
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
