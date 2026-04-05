import { MaintenanceLog } from '../entities/maintenance-log.entity';
import { MaintenanceType } from '../enums/maintenance-type.enum';

export interface FindAllMaintenanceLogsOptions {
  page?: number;
  limit?: number;
  droneId?: string;
  type?: MaintenanceType;
  startDate?: Date;
  endDate?: Date;
  sortBy?: 'datePerformed' | 'createdAt';
  sortOrder?: 'ASC' | 'DESC';
}

export interface IMaintenanceLogRepository {
  findById(id: string): Promise<MaintenanceLog | null>;
  findAll(
    options?: FindAllMaintenanceLogsOptions,
  ): Promise<{ data: MaintenanceLog[]; total: number }>;
  save(log: MaintenanceLog): Promise<MaintenanceLog>;
}

export const MAINTENANCE_LOG_REPOSITORY = Symbol('IMaintenanceLogRepository');
