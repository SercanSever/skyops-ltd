import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DroneOrmEntity } from '../drone/infrastructure/persistence/drone.orm-entity';
import { MissionOrmEntity } from '../mission/infrastructure/persistence/mission.orm-entity';
import { DroneStatus } from '../drone/domain/enums/drone-status.enum';
import { MissionStatus } from '../mission/domain/enums/mission-status.enum';

export interface FleetHealthReport {
  totalDrones: number;
  dronesByStatus: Record<DroneStatus, number>;
  overdueMaintenanceDrones: Array<{
    id: string;
    serialNumber: string;
    model: string;
    nextMaintenanceDueDate: string;
  }>;
  missionsNext24Hours: number;
  averageFlightHours: number;
}

@Injectable()
export class FleetHealthService {
  constructor(
    @InjectRepository(DroneOrmEntity)
    private readonly droneRepository: Repository<DroneOrmEntity>,
    @InjectRepository(MissionOrmEntity)
    private readonly missionRepository: Repository<MissionOrmEntity>,
  ) {}

  async getReport(): Promise<FleetHealthReport> {
    const [
      totalDrones,
      dronesByStatus,
      overdueMaintenanceDrones,
      missionsNext24Hours,
      averageFlightHours,
    ] = await Promise.all([
      this.getTotalDrones(),
      this.getDronesByStatus(),
      this.getOverdueMaintenanceDrones(),
      this.getMissionsNext24Hours(),
      this.getAverageFlightHours(),
    ]);

    return {
      totalDrones,
      dronesByStatus,
      overdueMaintenanceDrones,
      missionsNext24Hours,
      averageFlightHours,
    };
  }

  private async getTotalDrones(): Promise<number> {
    return this.droneRepository.count();
  }

  private async getDronesByStatus(): Promise<Record<DroneStatus, number>> {
    const result: Record<DroneStatus, number> = {
      [DroneStatus.AVAILABLE]: 0,
      [DroneStatus.IN_MISSION]: 0,
      [DroneStatus.MAINTENANCE]: 0,
      [DroneStatus.RETIRED]: 0,
    };

    const counts = await this.droneRepository
      .createQueryBuilder('drone')
      .select('drone.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('drone.status')
      .getRawMany<{ status: DroneStatus; count: string }>();

    for (const row of counts) {
      result[row.status] = parseInt(row.count, 10);
    }

    return result;
  }

  private async getOverdueMaintenanceDrones(): Promise<
    FleetHealthReport['overdueMaintenanceDrones']
  > {
    const now = new Date();

    const overdue = await this.droneRepository
      .createQueryBuilder('drone')
      .where('drone.nextMaintenanceDueDate <= :now', { now })
      .andWhere('drone.nextMaintenanceDueDate IS NOT NULL')
      .andWhere('drone.status != :retired', { retired: DroneStatus.RETIRED })
      .getMany();

    return overdue.map((d) => ({
      id: d.id,
      serialNumber: d.serialNumber,
      model: d.model,
      nextMaintenanceDueDate: d.nextMaintenanceDueDate!.toISOString(),
    }));
  }

  private async getMissionsNext24Hours(): Promise<number> {
    const now = new Date();
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    return this.missionRepository
      .createQueryBuilder('mission')
      .where('mission.plannedStartTime >= :now', { now })
      .andWhere('mission.plannedStartTime <= :next24h', { next24h })
      .andWhere('mission.status IN (:...statuses)', {
        statuses: [MissionStatus.PLANNED, MissionStatus.PRE_FLIGHT_CHECK],
      })
      .getCount();
  }

  private async getAverageFlightHours(): Promise<number> {
    const result = await this.droneRepository
      .createQueryBuilder('drone')
      .select('AVG(drone.totalFlightHours)', 'avg')
      .getRawOne<{ avg: string | null }>();

    return result?.avg ? parseFloat(parseFloat(result.avg).toFixed(2)) : 0;
  }
}
