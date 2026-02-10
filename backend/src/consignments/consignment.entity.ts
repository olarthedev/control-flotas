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
    ACTIVE = 'ACTIVE', // Consignación activa
    CLOSED = 'CLOSED', // Consignación cerrada/finalizada
    DISPUTED = 'DISPUTED', // En disputa por diferencias
}

@Entity('consignments')
export class Consignment {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    consignmentNumber: string; // Número único de consignación

    // ================== DINERO CONSIGNADO ==================
    @Column({ type: 'decimal', precision: 12, scale: 2 })
    amount: number; // Dinero entregado al conductor

    @Column({ type: 'timestamp' })
    consignmentDate: Date; // Fecha de entrega del dinero

    @Column({ nullable: true })
    consignmentNotes: string | null; // Notas sobre la consignación

    // ================== SEGUIMIENTO FINANCIERO ==================
    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    totalExpensesReported: number; // Total de gastos reportados

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    totalApprovedExpenses: number; // Total de gastos aprobados

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    balance: number; // Saldo disponible (consignado - aprobados)

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    surplus: number; // Dinero sobrante (si balance es positivo)

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    deficit: number; // Dinero faltante (si balance es negativo)

    @Column({
        type: 'enum',
        enum: ConsignmentStatus,
        default: ConsignmentStatus.ACTIVE,
    })
    status: ConsignmentStatus;

    // ================== CIERRE ==================
    @Column({ type: 'timestamp', nullable: true })
    closingDate: Date | null; // Fecha de cierre de la consignación

    @Column({ nullable: true })
    closingNotes: string | null; // Notas al cerrar

    @Column({ default: false })
    fullyClosed: boolean; // Si se cerró completamente (saldo = 0)

    // ================== RELACIONES ==================
    @ManyToOne(() => User, { nullable: false })
    driver: User; // Conductor que recibe el dinero

    @ManyToOne(() => Vehicle, { nullable: true })
    vehicle: Vehicle; // Vehículo asociado (opcional)

    @ManyToOne(() => Trip, (trip) => trip.consignments, { nullable: true })
    trip: Trip; // Viaje asociado (opcional)

    @OneToMany(() => Expense, (expense) => expense.consignment, { cascade: true })
    expenses: Expense[]; // Gastos relacionados a esta consignación

    // ================== AUDITORÍA ==================
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
