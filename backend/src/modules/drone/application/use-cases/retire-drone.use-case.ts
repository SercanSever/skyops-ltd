import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleViolationException } from '../../../../common/exceptions/business-rule-violation.exception';
import { Drone } from '../../domain/entities/drone.entity';
import type { IDroneRepository } from '../../domain/repositories/drone.repository.interface';
import { DRONE_REPOSITORY } from '../../domain/repositories/drone.repository.interface';

@Injectable()
export class RetireDroneUseCase {
  constructor(
    @Inject(DRONE_REPOSITORY)
    private readonly droneRepository: IDroneRepository,
  ) {}

  async execute(id: string): Promise<Drone> {
    const drone = await this.droneRepository.findById(id);
    if (!drone) {
      throw new BusinessRuleViolationException(
        `Drone with id "${id}" not found`,
        404,
      );
    }

    const hasScheduledMissions =
      await this.droneRepository.hasScheduledMissions(id);

    try {
      drone.retire(hasScheduledMissions);
    } catch (error) {
      throw new BusinessRuleViolationException((error as Error).message, 422, {
        droneId: id,
        currentStatus: drone.status,
      });
    }

    return this.droneRepository.save(drone);
  }
}
