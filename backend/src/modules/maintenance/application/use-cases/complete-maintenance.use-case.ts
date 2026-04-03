import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleViolationException } from '../../../../common/exceptions/business-rule-violation.exception';
import { MaintenanceLog } from '../../domain/entities/maintenance-log.entity';
import type { IMaintenanceLogRepository } from '../../domain/repositories/maintenance-log.repository.interface';
import { MAINTENANCE_LOG_REPOSITORY } from '../../domain/repositories/maintenance-log.repository.interface';
import type { IDroneRepository } from '../../../drone/domain/repositories/drone.repository.interface';
import { DRONE_REPOSITORY } from '../../../drone/domain/repositories/drone.repository.interface';

@Injectable()
export class CompleteMaintenanceUseCase {
  constructor(
    @Inject(MAINTENANCE_LOG_REPOSITORY)
    private readonly maintenanceLogRepository: IMaintenanceLogRepository,
    @Inject(DRONE_REPOSITORY)
    private readonly droneRepository: IDroneRepository,
  ) {}

  async execute(id: string): Promise<MaintenanceLog> {
    const log = await this.maintenanceLogRepository.findById(id);
    if (!log) {
      throw new BusinessRuleViolationException(
        `Maintenance log with id "${id}" not found`,
        404,
      );
    }

    const drone = await this.droneRepository.findById(log.droneId);
    if (!drone) {
      throw new BusinessRuleViolationException(
        `Drone with id "${log.droneId}" not found`,
        404,
      );
    }

    drone.setAvailable();
    await this.droneRepository.save(drone);

    return log;
  }
}
