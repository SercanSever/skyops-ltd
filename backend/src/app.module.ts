import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import databaseConfig from './config/database.config';
import { DroneModule } from './modules/drone/infrastructure/drone.module';
import { MissionModule } from './modules/mission/infrastructure/mission.module';
import { MaintenanceModule } from './modules/maintenance/infrastructure/maintenance.module';
import { FleetHealthModule } from './modules/fleet-health/fleet-health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env', '.env'],
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.getOrThrow('database'),
    }),
    DroneModule,
    MissionModule,
    MaintenanceModule,
    FleetHealthModule,
  ],
})
export class AppModule {}
