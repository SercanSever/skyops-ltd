import { BusinessRuleViolationException } from '../../../../common/exceptions/business-rule-violation.exception';
import { Drone } from '../../domain/entities/drone.entity';
import { IDroneRepository } from '../../domain/repositories/drone.repository.interface';

export class GetDroneUseCase {
  constructor(private readonly droneRepository: IDroneRepository) {}

  async execute(id: string): Promise<Drone> {
    const drone = await this.droneRepository.findById(id);
    if (!drone) {
      throw new BusinessRuleViolationException(
        `Drone with id "${id}" not found`,
        404,
      );
    }
    return drone;
  }
}
