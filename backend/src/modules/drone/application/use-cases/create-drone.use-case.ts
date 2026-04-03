import { BusinessRuleViolationException } from '../../../../common/exceptions/business-rule-violation.exception';
import { Drone } from '../../domain/entities/drone.entity';
import { IDroneRepository } from '../../domain/repositories/drone.repository.interface';
import { CreateDroneInput } from '../dto/create-drone.input';

export class CreateDroneUseCase {
  constructor(private readonly droneRepository: IDroneRepository) {}

  async execute(input: CreateDroneInput): Promise<Drone> {
    const existing = await this.droneRepository.findBySerialNumber(
      input.serialNumber,
    );
    if (existing) {
      throw new BusinessRuleViolationException(
        `Drone with serial number "${input.serialNumber}" already exists`,
        409,
        { field: 'serialNumber', value: input.serialNumber },
      );
    }

    const drone = Drone.create({
      serialNumber: input.serialNumber,
      model: input.model,
    });

    return this.droneRepository.save(drone);
  }
}
