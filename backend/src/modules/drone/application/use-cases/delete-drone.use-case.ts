import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleViolationException } from '../../../../common/exceptions/business-rule-violation.exception';
import type { IDroneRepository } from '../../domain/repositories/drone.repository.interface';
import { DRONE_REPOSITORY } from '../../domain/repositories/drone.repository.interface';

@Injectable()
export class DeleteDroneUseCase {
  constructor(
    @Inject(DRONE_REPOSITORY)
    private readonly droneRepository: IDroneRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const drone = await this.droneRepository.findById(id);
    if (!drone) {
      throw new BusinessRuleViolationException(
        `Drone with id "${id}" not found`,
        404,
      );
    }

    const hasScheduledMissions =
      await this.droneRepository.hasScheduledMissions(id);
    if (hasScheduledMissions) {
      throw new BusinessRuleViolationException(
        'Cannot delete drone with scheduled missions',
        409,
        { droneId: id },
      );
    }

    try {
      await this.droneRepository.delete(id);
    } catch {
      throw new BusinessRuleViolationException(
        'Cannot delete drone with related mission or maintenance records',
        409,
        { droneId: id },
      );
    }
  }
}
