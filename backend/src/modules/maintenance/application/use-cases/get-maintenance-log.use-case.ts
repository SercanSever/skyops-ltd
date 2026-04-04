import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleViolationException } from '../../../../common/exceptions/business-rule-violation.exception';
import { MaintenanceLog } from '../../domain/entities/maintenance-log.entity';
import type { IMaintenanceLogRepository } from '../../domain/repositories/maintenance-log.repository.interface';
import { MAINTENANCE_LOG_REPOSITORY } from '../../domain/repositories/maintenance-log.repository.interface';

@Injectable()
export class GetMaintenanceLogUseCase {
  constructor(
    @Inject(MAINTENANCE_LOG_REPOSITORY)
    private readonly maintenanceLogRepository: IMaintenanceLogRepository,
  ) {}

  async execute(id: string): Promise<MaintenanceLog> {
    const log = await this.maintenanceLogRepository.findById(id);
    if (!log) {
      throw new BusinessRuleViolationException(
        `Maintenance log with id "${id}" not found`,
        404,
      );
    }
    return log;
  }
}
