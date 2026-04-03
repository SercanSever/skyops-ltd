import { Drone } from '../../domain/entities/drone.entity';
import {
  FindAllDronesOptions,
  IDroneRepository,
} from '../../domain/repositories/drone.repository.interface';

export class ListDronesUseCase {
  constructor(private readonly droneRepository: IDroneRepository) {}

  async execute(
    options?: FindAllDronesOptions,
  ): Promise<{ data: Drone[]; total: number }> {
    return this.droneRepository.findAll(options);
  }
}
