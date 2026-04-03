import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MaintenanceType } from '../../domain/enums/maintenance-type.enum';
import { DroneOrmEntity } from '../../../drone/infrastructure/persistence/drone.orm-entity';

@Entity('maintenance_logs')
export class MaintenanceLogOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'drone_id', type: 'uuid' })
  droneId!: string;

  @Column({
    type: 'enum',
    enum: MaintenanceType,
    enumName: 'maintenance_type',
  })
  type!: MaintenanceType;

  @Column({ name: 'technician_name', type: 'varchar' })
  technicianName!: string;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  @Column({ name: 'date_performed', type: 'timestamptz' })
  datePerformed!: Date;

  @Column({
    name: 'flight_hours_at_maintenance',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  flightHoursAtMaintenance!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => DroneOrmEntity, (drone) => drone.maintenanceLogs, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'drone_id' })
  drone!: DroneOrmEntity;
}
