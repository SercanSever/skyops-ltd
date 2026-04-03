import { BusinessRuleViolationException } from '../../../../common/exceptions/business-rule-violation.exception';
import { Drone } from '../../domain/entities/drone.entity';
import { IDroneRepository } from '../../domain/repositories/drone.repository.interface';
import { UpdateDroneInput } from '../dto/update-drone.input';

export class UpdateDroneUseCase {
  constructor(private readonly droneRepository: IDroneRepository) {}

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
