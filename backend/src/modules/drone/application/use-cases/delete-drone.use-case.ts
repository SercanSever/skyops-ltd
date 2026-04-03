import { BusinessRuleViolationException } from '../../../../common/exceptions/business-rule-violation.exception';
import { IDroneRepository } from '../../domain/repositories/drone.repository.interface';

export class DeleteDroneUseCase {
  constructor(private readonly droneRepository: IDroneRepository) {}

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
