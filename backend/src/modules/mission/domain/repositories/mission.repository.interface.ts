import { Mission } from '../entities/mission.entity';
import { MissionStatus } from '../enums/mission-status.enum';

export interface FindAllMissionsOptions {
  page?: number;
  limit?: number;
  status?: MissionStatus;
  droneId?: string;
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'plannedStartTime' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}

export interface IMissionRepository {
  findById(id: string): Promise<Mission | null>;
  findAll(
    options?: FindAllMissionsOptions,
  ): Promise<{ data: Mission[]; total: number }>;
  save(mission: Mission): Promise<Mission>;
  findOverlapping(
    droneId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ): Promise<Mission | null>;
  findByDroneAndStatuses(
    droneId: string,
    statuses: MissionStatus[],
  ): Promise<Mission[]>;
}

export const MISSION_REPOSITORY = Symbol('IMissionRepository');
