import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
} from 'typeorm';
import { Expense } from '../expenses/expense.entity';

@Entity('evidence')
export class Evidence {
    @PrimaryGeneratedColumn()
    id: number;

    // ================== INFORMACIÓN DEL ARCHIVO ==================
    @Column()
    fileName: string; // Nombre original del archivo

    @Column()
    filePath: string; // Ruta donde se almacena la imagen

    @Column()
    fileUrl: string; // URL pública para acceder a la imagen

    @Column()
    fileType: string; // Tipo MIME (image/jpeg, image/png, etc)

    @Column({ type: 'bigint' })
    fileSize: number; // Tamaño en bytes

    // ================== METADATOS ==================
    @Column({ nullable: true })
    description: string | null; // Descripción de la foto (ej: "Recibo de SOAT")

    @Column({ default: false })
    isPrimary: boolean; // Indica si es la foto principal del gasto

    @Column({ type: 'text', nullable: true })
    notes: string | null; // Notas adicionales sobre la evidencia

    // ================== VALIDACIÓN ==================
    @Column({ default: true })
    isValid: boolean; // Si la evidencia es clara/válida

    @Column({ nullable: true })
    validationNotes: string; // Notas sobre la validez de la foto

    // ================== RELACIONES ==================
    @ManyToOne(() => Expense, (expense) => expense.evidence, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    expense: Expense; // Gasto asociado

    // ================== AUDITORÍA ==================
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
