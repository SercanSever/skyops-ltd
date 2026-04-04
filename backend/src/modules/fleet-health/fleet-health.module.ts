import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DroneOrmEntity } from '../drone/infrastructure/persistence/drone.orm-entity';
import { MissionOrmEntity } from '../mission/infrastructure/persistence/mission.orm-entity';
import { FleetHealthService } from './fleet-health.service';
import { FleetHealthController } from './fleet-health.controller';

@Module({
  imports: [TypeOrmModule.forFeature([DroneOrmEntity, MissionOrmEntity])],
  controllers: [FleetHealthController],
  providers: [FleetHealthService],
})
export class FleetHealthModule {}
