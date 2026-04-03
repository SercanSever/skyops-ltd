import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MissionOrmEntity } from './persistence/mission.orm-entity';
import { MissionRepository } from './persistence/mission.repository';
import { MISSION_REPOSITORY } from '../domain/repositories/mission.repository.interface';
import { DroneModule } from '../../drone/infrastructure/drone.module';
import { CreateMissionUseCase } from '../application/use-cases/create-mission.use-case';
import { GetMissionUseCase } from '../application/use-cases/get-mission.use-case';
import { ListMissionsUseCase } from '../application/use-cases/list-missions.use-case';
import { TransitionMissionUseCase } from '../application/use-cases/transition-mission.use-case';
import { MissionController } from '../presentation/mission.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MissionOrmEntity]), DroneModule],
  controllers: [MissionController],
  providers: [
    { provide: MISSION_REPOSITORY, useClass: MissionRepository },
    CreateMissionUseCase,
    GetMissionUseCase,
    ListMissionsUseCase,
    TransitionMissionUseCase,
  ],
  exports: [
    MISSION_REPOSITORY,
    CreateMissionUseCase,
    GetMissionUseCase,
    ListMissionsUseCase,
    TransitionMissionUseCase,
  ],
})
export class MissionModule {}
