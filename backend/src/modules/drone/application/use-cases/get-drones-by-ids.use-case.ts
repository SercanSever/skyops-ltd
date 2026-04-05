import { Inject, Injectable } from '@nestjs/common';
import { Drone } from '../../domain/entities/drone.entity';
import type { IDroneRepository } from '../../domain/repositories/drone.repository.interface';
import { DRONE_REPOSITORY } from '../../domain/repositories/drone.repository.interface';

@Injectable()
export class GetDronesByIdsUseCase {
  constructor(
    @Inject(DRONE_REPOSITORY)
    private readonly droneRepository: IDroneRepository,
  ) {}

  async execute(ids: string[]): Promise<Drone[]> {
    const uniqueIds = [...new Set(ids)];
    return this.droneRepository.findByIds(uniqueIds);
  }
}
