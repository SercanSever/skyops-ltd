import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { DroneModel } from '../../domain/enums/drone-model.enum';
import { DroneStatus } from '../../domain/enums/drone-status.enum';
import { MissionOrmEntity } from '../../../mission/infrastructure/persistence/mission.orm-entity';
import { MaintenanceLogOrmEntity } from '../../../maintenance/infrastructure/persistence/maintenance-log.orm-entity';

@Entity('drones')
export class DroneOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'serial_number', type: 'varchar' })
  serialNumber!: string;

  @Column({
    type: 'enum',
    enum: DroneModel,
    enumName: 'drone_model',
  })
  model!: DroneModel;

  @Index()
  @Column({
    type: 'enum',
    enum: DroneStatus,
    enumName: 'drone_status',
    default: DroneStatus.AVAILABLE,
  })
  status!: DroneStatus;

  @Column({
    name: 'total_flight_hours',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  totalFlightHours!: string;

  @Column({
    name: 'last_maintenance_date',
    type: 'timestamptz',
    nullable: true,
  })
  lastMaintenanceDate!: Date | null;

  @Column({
    name: 'next_maintenance_due_date',
    type: 'timestamptz',
    nullable: true,
  })
  nextMaintenanceDueDate!: Date | null;

  @VersionColumn()
  version!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => MissionOrmEntity, (mission) => mission.drone)
  missions!: MissionOrmEntity[];

  @OneToMany(
    () => MaintenanceLogOrmEntity,
    (maintenanceLog) => maintenanceLog.drone,
  )
  maintenanceLogs!: MaintenanceLogOrmEntity[];
}
