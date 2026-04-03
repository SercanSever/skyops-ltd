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
import { MissionStatus } from '../../domain/enums/mission-status.enum';
import { MissionType } from '../../domain/enums/mission-type.enum';
import { DroneOrmEntity } from '../../../drone/infrastructure/persistence/drone.orm-entity';

@Entity('missions')
@Index('IDX_missions_planned_times', ['plannedStartTime', 'plannedEndTime'])
export class MissionOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  name!: string;

  @Column({
    type: 'enum',
    enum: MissionType,
    enumName: 'mission_type',
  })
  type!: MissionType;

  @Index()
  @Column({ name: 'drone_id', type: 'uuid' })
  droneId!: string;

  @Column({ name: 'pilot_name', type: 'varchar' })
  pilotName!: string;

  @Column({ name: 'site_location', type: 'varchar' })
  siteLocation!: string;

  @Index()
  @Column({
    type: 'enum',
    enum: MissionStatus,
    enumName: 'mission_status',
    default: MissionStatus.PLANNED,
  })
  status!: MissionStatus;

  @Column({ name: 'planned_start_time', type: 'timestamptz' })
  plannedStartTime!: Date;

  @Column({ name: 'planned_end_time', type: 'timestamptz' })
  plannedEndTime!: Date;

  @Column({
    name: 'actual_start_time',
    type: 'timestamptz',
    nullable: true,
  })
  actualStartTime!: Date | null;

  @Column({
    name: 'actual_end_time',
    type: 'timestamptz',
    nullable: true,
  })
  actualEndTime!: Date | null;

  @Column({
    name: 'flight_hours',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  flightHours!: string | null;

  @Column({
    name: 'abort_reason',
    type: 'text',
    nullable: true,
  })
  abortReason!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne(() => DroneOrmEntity, (drone) => drone.missions, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'drone_id' })
  drone!: DroneOrmEntity;
}
