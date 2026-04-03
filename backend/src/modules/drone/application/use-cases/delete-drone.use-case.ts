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

    await this.droneRepository.delete(id);
  }
}
