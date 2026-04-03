import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleViolationException } from '../../../../common/exceptions/business-rule-violation.exception';
import { Mission } from '../../domain/entities/mission.entity';
import type { IMissionRepository } from '../../domain/repositories/mission.repository.interface';
import { MISSION_REPOSITORY } from '../../domain/repositories/mission.repository.interface';

@Injectable()
export class GetMissionUseCase {
  constructor(
    @Inject(MISSION_REPOSITORY)
    private readonly missionRepository: IMissionRepository,
  ) {}

  async execute(id: string): Promise<Mission> {
    const mission = await this.missionRepository.findById(id);
    if (!mission) {
      throw new BusinessRuleViolationException(
        `Mission with id "${id}" not found`,
        404,
      );
    }
    return mission;
  }
}
