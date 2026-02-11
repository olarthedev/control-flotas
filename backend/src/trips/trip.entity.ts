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

@Entity('trips')
export class Trip {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    tripNumber: string; // Número de viaje único

    @Column({ type: 'timestamp' })
    startDate: Date; // Fecha/hora de inicio

    @Column({ type: 'timestamp', nullable: true })
    endDate: Date | null; // Fecha/hora de finalización

    @Column({ type: 'text', nullable: true })
    origin: string | null; // Punto de partida

    @Column({ type: 'text', nullable: true })
    destination: string | null; // Destino

    @Column({ type: 'text', nullable: true })
    description: string | null; // Descripción de la carga

    @Column({
        type: 'enum',
        enum: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        default: 'IN_PROGRESS',
    })
    status: string;

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    plannedBudget: number; // Presupuesto planificado para el viaje

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    totalExpenses: number; // Total de gastos en el viaje (calculado automáticamente)

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    totalConsigned: number; // Dinero consignado para este viaje

    @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
    difference: number; // Diferencia entre consignado y gastado

    // ================== RELACIONES ==================
    @ManyToOne(() => User, { nullable: false })
    driver: User; // Conductor del viaje

    @ManyToOne(() => Vehicle, (vehicle) => vehicle.trips, {
        nullable: false,
    })
    vehicle: Vehicle; // Vehículo utilizado

    @OneToMany(() => Expense, (expense) => expense.trip, { cascade: true })
    expenses: Expense[];

    @OneToMany(() => Consignment, (consignment) => consignment.trip, {
        cascade: true,
    })
    consignments: Consignment[];

    // ================== AUDITORÍA ==================
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
