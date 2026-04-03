import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleViolationException } from '../../../../common/exceptions/business-rule-violation.exception';
import { MaintenanceLog } from '../../domain/entities/maintenance-log.entity';
import type { IMaintenanceLogRepository } from '../../domain/repositories/maintenance-log.repository.interface';
import { MAINTENANCE_LOG_REPOSITORY } from '../../domain/repositories/maintenance-log.repository.interface';
import { DroneStatus } from '../../../drone/domain/enums/drone-status.enum';
import type { IDroneRepository } from '../../../drone/domain/repositories/drone.repository.interface';
import { DRONE_REPOSITORY } from '../../../drone/domain/repositories/drone.repository.interface';
import { CreateMaintenanceLogInput } from '../dto/create-maintenance-log.input';

@Injectable()
export class CreateMaintenanceLogUseCase {
  constructor(
    @Inject(MAINTENANCE_LOG_REPOSITORY)
    private readonly maintenanceLogRepository: IMaintenanceLogRepository,
    @Inject(DRONE_REPOSITORY)
    private readonly droneRepository: IDroneRepository,
  ) {}

  async execute(input: CreateMaintenanceLogInput): Promise<MaintenanceLog> {
    const drone = await this.droneRepository.findById(input.droneId);
    if (!drone) {
      throw new BusinessRuleViolationException(
        `Drone with id "${input.droneId}" not found`,
        404,
      );
    }

    if (drone.status === DroneStatus.IN_MISSION) {
      throw new BusinessRuleViolationException(
        'Cannot start maintenance on a drone that is currently on a mission',
        422,
        { droneId: input.droneId, currentStatus: drone.status },
      );
    }

    const hoursDiff = Math.abs(
      drone.totalFlightHours - input.flightHoursAtMaintenance,
    );
    if (hoursDiff > 1) {
      throw new BusinessRuleViolationException(
        `Flight hours at maintenance (${input.flightHoursAtMaintenance}) is inconsistent with drone total flight hours (${drone.totalFlightHours}). Tolerance: ±1 hour.`,
        422,
        {
          field: 'flightHoursAtMaintenance',
          provided: input.flightHoursAtMaintenance,
          droneTotalFlightHours: drone.totalFlightHours,
        },
      );
    }

    const maintenanceLog = MaintenanceLog.create({
      droneId: input.droneId,
      type: input.type,
      technicianName: input.technicianName,
      notes: input.notes,
      datePerformed: input.datePerformed,
      flightHoursAtMaintenance: input.flightHoursAtMaintenance,
    });

    drone.setMaintenance();
    drone.updateLastMaintenanceDate(input.datePerformed);
    drone.calculateNextMaintenanceDate();
    await this.droneRepository.save(drone);

    return this.maintenanceLogRepository.save(maintenanceLog);
  }
}
