import { Inject, Injectable } from '@nestjs/common';
import { Drone } from '../../domain/entities/drone.entity';
import type {
  FindAllDronesOptions,
  IDroneRepository,
} from '../../domain/repositories/drone.repository.interface';
import { DRONE_REPOSITORY } from '../../domain/repositories/drone.repository.interface';

@Injectable()
export class ListDronesUseCase {
  constructor(
    @Inject(DRONE_REPOSITORY)
    private readonly droneRepository: IDroneRepository,
  ) {}

  async execute(
    options?: FindAllDronesOptions,
  ): Promise<{ data: Drone[]; total: number }> {
    return this.droneRepository.findAll(options);
  }
}
