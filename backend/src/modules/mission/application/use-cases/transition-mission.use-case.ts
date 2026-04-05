import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleViolationException } from '../../../../common/exceptions/business-rule-violation.exception';
import { Mission } from '../../domain/entities/mission.entity';
import { MissionStatus } from '../../domain/enums/mission-status.enum';
import type { IMissionRepository } from '../../domain/repositories/mission.repository.interface';
import { MISSION_REPOSITORY } from '../../domain/repositories/mission.repository.interface';
import { DroneStatus } from '../../../drone/domain/enums/drone-status.enum';
import type { IDroneRepository } from '../../../drone/domain/repositories/drone.repository.interface';
import { DRONE_REPOSITORY } from '../../../drone/domain/repositories/drone.repository.interface';
import { TransitionMissionInput } from '../dto/transition-mission.input';

@Injectable()
export class TransitionMissionUseCase {
  constructor(
    @Inject(MISSION_REPOSITORY)
    private readonly missionRepository: IMissionRepository,
    @Inject(DRONE_REPOSITORY)
    private readonly droneRepository: IDroneRepository,
  ) {}

  async execute(id: string, input: TransitionMissionInput): Promise<Mission> {
    const mission = await this.missionRepository.findById(id);
    if (!mission) {
      throw new BusinessRuleViolationException(
        `Mission with id "${id}" not found`,
        404,
      );
    }

    const previousStatus = mission.status;

    try {
      mission.transitionTo(input.status, {
        flightHours: input.flightHours,
        abortReason: input.abortReason,
      });
    } catch (error) {
      throw new BusinessRuleViolationException((error as Error).message, 422, {
        missionId: id,
        currentStatus: previousStatus,
        targetStatus: input.status,
      });
    }

    const drone = await this.droneRepository.findById(mission.droneId);
    if (!drone) {
      throw new BusinessRuleViolationException(
        `Drone with id "${mission.droneId}" not found`,
        404,
      );
    }

    if (
      previousStatus === MissionStatus.PRE_FLIGHT_CHECK &&
      input.status === MissionStatus.IN_PROGRESS
    ) {
      drone.setInMission();
      await this.droneRepository.save(drone);
    }

    if (input.status === MissionStatus.COMPLETED && input.flightHours) {
      drone.addFlightHours(input.flightHours);
      drone.calculateNextMaintenanceDate();

      // Case study: "The system should check if maintenance is now due"
      // If either 50-hour or 90-day rule is triggered after adding
      // flight hours, set nextMaintenanceDueDate to now so dashboard
      // shows it as overdue maintenance
      if (drone.isMaintenanceDue()) {
        drone.setNextMaintenanceDueDate(new Date());
      }

      drone.setAvailable();
      await this.droneRepository.save(drone);
    }

    if (input.status === MissionStatus.ABORTED) {
      if (drone.status === DroneStatus.IN_MISSION) {
        drone.setAvailable();
        await this.droneRepository.save(drone);
      }
    }

    return this.missionRepository.save(mission);
  }
}
