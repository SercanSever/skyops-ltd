import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindOptionsWhere,
  OptimisticLockVersionMismatchError,
} from 'typeorm';
import { Drone } from '../../domain/entities/drone.entity';
import {
  FindAllDronesOptions,
  IDroneRepository,
} from '../../domain/repositories/drone.repository.interface';
import { BusinessRuleViolationException } from '../../../../common/exceptions/business-rule-violation.exception';
import { DroneOrmEntity } from './drone.orm-entity';
import { DroneMapper } from './drone.mapper';
import { MissionOrmEntity } from '../../../mission/infrastructure/persistence/mission.orm-entity';
import { MissionStatus } from '../../../mission/domain/enums/mission-status.enum';

@Injectable()
export class DroneRepository implements IDroneRepository {
  constructor(
    @InjectRepository(DroneOrmEntity)
    private readonly repository: Repository<DroneOrmEntity>,
  ) {}

  async findById(id: string): Promise<Drone | null> {
    const orm = await this.repository.findOne({ where: { id } });
    return orm ? DroneMapper.toDomain(orm) : null;
  }

  async findBySerialNumber(serialNumber: string): Promise<Drone | null> {
    const orm = await this.repository.findOne({
      where: { serialNumber },
    });
    return orm ? DroneMapper.toDomain(orm) : null;
  }

  async findAll(
    options?: FindAllDronesOptions,
  ): Promise<{ data: Drone[]; total: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;

    const where: FindOptionsWhere<DroneOrmEntity> = {};
    if (options?.status) {
      where.status = options.status;
    }
    if (options?.model) {
      where.model = options.model;
    }

    const [entities, total] = await this.repository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: entities.map((entity) => DroneMapper.toDomain(entity)),
      total,
    };
  }

  async findByIds(ids: string[]): Promise<Drone[]> {
    if (ids.length === 0) return [];
    const entities = await this.repository
      .createQueryBuilder('drone')
      .where('drone.id IN (:...ids)', { ids })
      .getMany();
    return entities.map((entity) => DroneMapper.toDomain(entity));
  }

  async save(drone: Drone): Promise<Drone> {
    try {
      const orm = DroneMapper.toOrm(drone);
      const saved = await this.repository.save(orm);
      return DroneMapper.toDomain(saved);
    } catch (error) {
      if (error instanceof OptimisticLockVersionMismatchError) {
        throw new BusinessRuleViolationException(
          'Drone was modified by another request. Please refresh and try again.',
          409,
          { entityId: drone.id, expectedVersion: drone.version },
        );
      }
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async hasScheduledMissions(droneId: string): Promise<boolean> {
    const count = await this.repository.manager
      .getRepository(MissionOrmEntity)
      .count({
        where: [
          { droneId, status: MissionStatus.PLANNED },
          { droneId, status: MissionStatus.PRE_FLIGHT_CHECK },
        ],
      });
    return count > 0;
  }
}
