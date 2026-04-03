import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleViolationException } from '../../../../common/exceptions/business-rule-violation.exception';
import { Mission } from '../../domain/entities/mission.entity';
import type { IMissionRepository } from '../../domain/repositories/mission.repository.interface';
import { MISSION_REPOSITORY } from '../../domain/repositories/mission.repository.interface';
import type { IDroneRepository } from '../../../drone/domain/repositories/drone.repository.interface';
import { DRONE_REPOSITORY } from '../../../drone/domain/repositories/drone.repository.interface';
import { CreateMissionInput } from '../dto/create-mission.input';

@Injectable()
export class CreateMissionUseCase {
  constructor(
    @Inject(MISSION_REPOSITORY)
    private readonly missionRepository: IMissionRepository,
    @Inject(DRONE_REPOSITORY)
    private readonly droneRepository: IDroneRepository,
  ) {}

  async execute(input: CreateMissionInput): Promise<Mission> {
    const drone = await this.droneRepository.findById(input.droneId);
    if (!drone) {
      throw new BusinessRuleViolationException(
        `Drone with id "${input.droneId}" not found`,
        404,
      );
    }

    if (!drone.isAvailable()) {
      throw new BusinessRuleViolationException(
        'Drone is not available for missions',
        422,
        { field: 'droneId', currentStatus: drone.status },
      );
    }

    if (input.plannedStartTime.getTime() <= Date.now()) {
      throw new BusinessRuleViolationException(
        'Planned start time must be in the future',
        422,
        { field: 'plannedStartTime' },
      );
    }

    const overlapping = await this.missionRepository.findOverlapping(
      input.droneId,
      input.plannedStartTime,
      input.plannedEndTime,
    );
    if (overlapping) {
      throw new BusinessRuleViolationException(
        'Mission time overlaps with an existing mission for this drone',
        409,
        {
          conflictingMissionId: overlapping.id,
          droneId: input.droneId,
        },
      );
    }

    const mission = Mission.create({
      name: input.name,
      type: input.type,
      droneId: input.droneId,
      pilotName: input.pilotName,
      siteLocation: input.siteLocation,
      plannedStartTime: input.plannedStartTime,
      plannedEndTime: input.plannedEndTime,
    });

    return this.missionRepository.save(mission);
  }
}
