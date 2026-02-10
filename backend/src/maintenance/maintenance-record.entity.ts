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
    PREVENTIVE = 'PREVENTIVE', // Mantenimiento preventivo
    CORRECTIVE = 'CORRECTIVE', // Reparación correctiva
    EMERGENCY = 'EMERGENCY', // Reparación de emergencia
    INSPECTION = 'INSPECTION', // Inspección técnica
}

@Entity('maintenance_records')
export class MaintenanceRecord {
    @PrimaryGeneratedColumn()
    id: number;

    // ================== INFORMACIÓN BÁSICA ==================
    @Column({
        type: 'enum',
        enum: MaintenanceType,
    })
    type: MaintenanceType;

    @Column()
    title: string; // Título del servicio (Cambio de aceite, Alineación, etc)

    @Column({ type: 'text' })
    description: string; // Descripción detallada del trabajo

    @Column({ type: 'timestamp' })
    maintenanceDate: Date; // Fecha del mantenimiento

    // ================== COSTOS ==================
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    cost: number; // Costo del mantenimiento

    @Column({ nullable: true })
    invoiceNumber: string; // Número de factura

    @Column({ nullable: true })
    provider: string; // Taller o proveedor

    // ================== SEGUIMIENTO TÉCNICO ==================
    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    mileageAtMaintenance: number; // Kilometraje al momento

    @Column({
        type: 'decimal',
        precision: 12,
        scale: 2,
        nullable: true,
    })
    nextMaintenanceMileage: number; // Próximo mantenimiento sugerido a esta distancia

    @Column({ type: 'timestamp', nullable: true })
    nextMaintenanceDate: Date; // Próximo mantenimiento sugerido en esta fecha

    @Column({ type: 'text', nullable: true })
    technicalNotes: string; // Notas técnicas

    // ================== ESTADO ==================
    @Column({
        type: 'enum',
        enum: ['COMPLETED', 'PENDING', 'SCHEDULED'],
        default: 'COMPLETED',
    })
    status: string;

    @Column({ default: false })
    requiresFollowUp: boolean; // Requiere seguimiento

    @Column({ nullable: true })
    followUpNotes: string; // Notas de seguimiento

    // ================== RELACIONES ==================
    @ManyToOne(() => Vehicle, (vehicle) => vehicle.maintenanceRecords, {
        nullable: false,
    })
    vehicle: Vehicle; // Vehículo mantenido

    @ManyToOne(() => User, { nullable: true })
    performedBy: User; // Usuario que registró (administrador)

    // ================== AUDITORÍA ==================
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
