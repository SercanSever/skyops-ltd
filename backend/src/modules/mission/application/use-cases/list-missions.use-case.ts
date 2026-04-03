import { Inject, Injectable } from '@nestjs/common';
import { Mission } from '../../domain/entities/mission.entity';
import type {
  FindAllMissionsOptions,
  IMissionRepository,
} from '../../domain/repositories/mission.repository.interface';
import { MISSION_REPOSITORY } from '../../domain/repositories/mission.repository.interface';

@Injectable()
export class ListMissionsUseCase {
  constructor(
    @Inject(MISSION_REPOSITORY)
    private readonly missionRepository: IMissionRepository,
  ) {}

  async execute(
    options?: FindAllMissionsOptions,
  ): Promise<{ data: Mission[]; total: number }> {
    return this.missionRepository.findAll(options);
  }
}
