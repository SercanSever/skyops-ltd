import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaintenanceLogOrmEntity } from './persistence/maintenance-log.orm-entity';
import { MaintenanceLogRepository } from './persistence/maintenance-log.repository';
import { MAINTENANCE_LOG_REPOSITORY } from '../domain/repositories/maintenance-log.repository.interface';
import { DroneModule } from '../../drone/infrastructure/drone.module';
import { CreateMaintenanceLogUseCase } from '../application/use-cases/create-maintenance-log.use-case';
import { GetMaintenanceLogUseCase } from '../application/use-cases/get-maintenance-log.use-case';
import { ListMaintenanceLogsUseCase } from '../application/use-cases/list-maintenance-logs.use-case';
import { CompleteMaintenanceUseCase } from '../application/use-cases/complete-maintenance.use-case';
import { MaintenanceController } from '../presentation/maintenance.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MaintenanceLogOrmEntity]), DroneModule],
  controllers: [MaintenanceController],
  providers: [
    { provide: MAINTENANCE_LOG_REPOSITORY, useClass: MaintenanceLogRepository },
    CreateMaintenanceLogUseCase,
    GetMaintenanceLogUseCase,
    ListMaintenanceLogsUseCase,
    CompleteMaintenanceUseCase,
  ],
  exports: [
    MAINTENANCE_LOG_REPOSITORY,
    CreateMaintenanceLogUseCase,
    GetMaintenanceLogUseCase,
    ListMaintenanceLogsUseCase,
    CompleteMaintenanceUseCase,
  ],
})
export class MaintenanceModule {}
