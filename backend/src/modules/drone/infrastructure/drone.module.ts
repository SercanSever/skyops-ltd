import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DroneOrmEntity } from './persistence/drone.orm-entity';
import { DroneRepository } from './persistence/drone.repository';
import { DRONE_REPOSITORY } from '../domain/repositories/drone.repository.interface';
import { CreateDroneUseCase } from '../application/use-cases/create-drone.use-case';
import { GetDroneUseCase } from '../application/use-cases/get-drone.use-case';
import { ListDronesUseCase } from '../application/use-cases/list-drones.use-case';
import { UpdateDroneUseCase } from '../application/use-cases/update-drone.use-case';
import { RetireDroneUseCase } from '../application/use-cases/retire-drone.use-case';
import { DeleteDroneUseCase } from '../application/use-cases/delete-drone.use-case';
import { GetDronesByIdsUseCase } from '../application/use-cases/get-drones-by-ids.use-case';
import { DroneController } from '../presentation/drone.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DroneOrmEntity])],
  controllers: [DroneController],
  providers: [
    { provide: DRONE_REPOSITORY, useClass: DroneRepository },
    CreateDroneUseCase,
    GetDroneUseCase,
    ListDronesUseCase,
    UpdateDroneUseCase,
    RetireDroneUseCase,
    DeleteDroneUseCase,
    GetDronesByIdsUseCase,
  ],
  exports: [
    DRONE_REPOSITORY,
    CreateDroneUseCase,
    GetDroneUseCase,
    ListDronesUseCase,
    UpdateDroneUseCase,
    RetireDroneUseCase,
    DeleteDroneUseCase,
    GetDronesByIdsUseCase,
  ],
})
export class DroneModule {}
