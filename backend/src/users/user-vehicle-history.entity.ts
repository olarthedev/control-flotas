import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Vehicle } from '../vehicles/vehicle.entity';

@Entity('user_vehicle_history')
export class UserVehicleHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.vehicleAssignmentHistory, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Vehicle, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'vehicle_id' })
    vehicle: Vehicle;

    @Column({ type: 'timestamp' })
    startDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    endDate: Date | null;
}
