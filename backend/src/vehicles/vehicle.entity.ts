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
import { Expense } from '../expenses/expense.entity';
import { MaintenanceRecord } from '../maintenance/maintenance-record.entity';
import { Trip } from '../trips/trip.entity';

@Entity('vehicles')
export class Vehicle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    licensePlate: string; // Placa del vehículo

    @Column()
    brand: string; // Marca (Chevrolet, Ford, etc)

    @Column()
    model: string; // Modelo

    @Column()
    year: number; // Año del vehículo

    @Column({ nullable: true })
    vin: string; // Número de serie

    @Column()
    type: string; // Tipo (Furgón, Cabezote, etc)

    @Column({ default: true })
    isActive: boolean;

    // ================== DOCUMENTOS Y VENCIMIENTOS ==================
    @Column({ type: 'date', nullable: true })
    soatExpiryDate: Date; // Fecha vencimiento SOAT

    @Column({ type: 'date', nullable: true })
    technicalReviewExpiryDate: Date; // Fecha vencimiento Tecnomecánica

    @Column({ type: 'date', nullable: true })
    insuranceExpiryDate: Date; // Fecha vencimiento Seguro

    @Column({ type: 'date', nullable: true })
    licenseExpiryDate: Date; // Fecha vencimiento Licencia/Tarjeta

    // Documentos opcionales
    @Column({ type: 'date', nullable: true })
    rtaExpiryDate: Date; // Certificado RTA (si aplica)

    @Column({ type: 'date', nullable: true })
    pollutionExpiryDate: Date; // Certificado de contaminación

    // ================== ALERTAS Y SEGUIMIENTO ==================
    @Column({ default: false })
    soatAboutToExpire: boolean; // Alerta si vence en 30 días

    @Column({ default: false })
    technicalReviewAboutToExpire: boolean;

    @Column({ default: false })
    insuranceAboutToExpire: boolean;

    @Column({ type: 'text', nullable: true })
    documentNotes: string; // Notas sobre documentos

    // ================== INFORMACIÓN OPERATIVA ==================
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    maintenanceBudget: number; // Presupuesto de mantenimiento anual

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    maintenanceSpent: number; // Dinero gastado en mantenimiento

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    currentMileage: number; // Kilometraje actual

    @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
    nextMaintenanceMileage: number; // Próximo mantenimiento a esta distancia

    // ================== RELACIONES ==================
    @ManyToOne(() => User, { nullable: true })
    driver: User; // Conductor asignado (puede estar sin asignar)

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
