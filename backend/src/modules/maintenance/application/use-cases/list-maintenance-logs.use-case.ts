import { Inject, Injectable } from '@nestjs/common';
import { MaintenanceLog } from '../../domain/entities/maintenance-log.entity';
import type {
  FindAllMaintenanceLogsOptions,
  IMaintenanceLogRepository,
} from '../../domain/repositories/maintenance-log.repository.interface';
import { MAINTENANCE_LOG_REPOSITORY } from '../../domain/repositories/maintenance-log.repository.interface';

@Injectable()
export class ListMaintenanceLogsUseCase {
  constructor(
    @Inject(MAINTENANCE_LOG_REPOSITORY)
    private readonly maintenanceLogRepository: IMaintenanceLogRepository,
  ) {}

  async execute(
    options?: FindAllMaintenanceLogsOptions,
  ): Promise<{ data: MaintenanceLog[]; total: number }> {
    return this.maintenanceLogRepository.findAll(options);
  }
}
