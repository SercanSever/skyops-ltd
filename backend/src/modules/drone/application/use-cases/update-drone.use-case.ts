import { Inject, Injectable } from '@nestjs/common';
import { BusinessRuleViolationException } from '../../../../common/exceptions/business-rule-violation.exception';
import { Drone } from '../../domain/entities/drone.entity';
import type { IDroneRepository } from '../../domain/repositories/drone.repository.interface';
import { DRONE_REPOSITORY } from '../../domain/repositories/drone.repository.interface';
import { UpdateDroneInput } from '../dto/update-drone.input';

@Injectable()
export class UpdateDroneUseCase {
  constructor(
    @Inject(DRONE_REPOSITORY)
    private readonly droneRepository: IDroneRepository,
  ) {}

  async execute(id: string, input: UpdateDroneInput): Promise<Drone> {
    const drone = await this.droneRepository.findById(id);
    if (!drone) {
      throw new BusinessRuleViolationException(
        `Drone with id "${id}" not found`,
        404,
      );
    }

    if (input.model !== undefined) {
      drone.updateModel(input.model);
    }

    return this.droneRepository.save(drone);
  }
}
