import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mission } from '../../domain/entities/mission.entity';
import { MissionStatus } from '../../domain/enums/mission-status.enum';
import {
  FindAllMissionsOptions,
  IMissionRepository,
} from '../../domain/repositories/mission.repository.interface';
import { MissionOrmEntity } from './mission.orm-entity';
import { MissionMapper } from './mission.mapper';

@Injectable()
export class MissionRepository implements IMissionRepository {
  constructor(
    @InjectRepository(MissionOrmEntity)
    private readonly repository: Repository<MissionOrmEntity>,
  ) {}

  async findById(id: string): Promise<Mission | null> {
    const orm = await this.repository.findOne({ where: { id } });
    return orm ? MissionMapper.toDomain(orm) : null;
  }

  async findAll(
    options?: FindAllMissionsOptions,
  ): Promise<{ data: Mission[]; total: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;

    const qb = this.repository.createQueryBuilder('mission');

    if (options?.status) {
      qb.andWhere('mission.status = :status', { status: options.status });
    }
    if (options?.droneId) {
      qb.andWhere('mission.droneId = :droneId', { droneId: options.droneId });
    }
    if (options?.startDate) {
      qb.andWhere('mission.plannedStartTime >= :startDate', {
        startDate: options.startDate,
      });
    }
    if (options?.endDate) {
      qb.andWhere('mission.plannedEndTime <= :endDate', {
        endDate: options.endDate,
      });
    }

    const sortBy = options?.sortBy ?? 'createdAt';
    const sortOrder = options?.sortOrder ?? 'DESC';
    qb.orderBy(`mission.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await qb.getManyAndCount();

    return {
      data: entities.map((entity) => MissionMapper.toDomain(entity)),
      total,
    };
  }

  async save(mission: Mission): Promise<Mission> {
    const orm = MissionMapper.toOrm(mission);
    const saved = await this.repository.save(orm);
    return MissionMapper.toDomain(saved);
  }

  async findOverlapping(
    droneId: string,
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ): Promise<Mission | null> {
    const qb = this.repository
      .createQueryBuilder('mission')
      .where('mission.droneId = :droneId', { droneId })
      .andWhere('mission.status IN (:...statuses)', {
        statuses: [
          MissionStatus.PLANNED,
          MissionStatus.PRE_FLIGHT_CHECK,
          MissionStatus.IN_PROGRESS,
        ],
      })
      .andWhere('mission.plannedStartTime < :endTime', { endTime })
      .andWhere('mission.plannedEndTime > :startTime', { startTime });

    if (excludeId) {
      qb.andWhere('mission.id != :excludeId', { excludeId });
    }

    const orm = await qb.getOne();
    return orm ? MissionMapper.toDomain(orm) : null;
  }

  async findByDroneAndStatuses(
    droneId: string,
    statuses: MissionStatus[],
  ): Promise<Mission[]> {
    const entities = await this.repository
      .createQueryBuilder('mission')
      .where('mission.droneId = :droneId', { droneId })
      .andWhere('mission.status IN (:...statuses)', { statuses })
      .getMany();

    return entities.map((entity) => MissionMapper.toDomain(entity));
  }
}
