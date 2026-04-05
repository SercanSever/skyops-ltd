import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaintenanceLog } from '../../domain/entities/maintenance-log.entity';
import {
  FindAllMaintenanceLogsOptions,
  IMaintenanceLogRepository,
} from '../../domain/repositories/maintenance-log.repository.interface';
import { MaintenanceLogOrmEntity } from './maintenance-log.orm-entity';
import { MaintenanceLogMapper } from './maintenance-log.mapper';

@Injectable()
export class MaintenanceLogRepository implements IMaintenanceLogRepository {
  constructor(
    @InjectRepository(MaintenanceLogOrmEntity)
    private readonly repository: Repository<MaintenanceLogOrmEntity>,
  ) {}

  async findById(id: string): Promise<MaintenanceLog | null> {
    const orm = await this.repository.findOne({ where: { id } });
    return orm ? MaintenanceLogMapper.toDomain(orm) : null;
  }

  async findAll(
    options?: FindAllMaintenanceLogsOptions,
  ): Promise<{ data: MaintenanceLog[]; total: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;

    const qb = this.repository.createQueryBuilder('log');

    if (options?.droneId) {
      qb.andWhere('log.droneId = :droneId', { droneId: options.droneId });
    }
    if (options?.type) {
      qb.andWhere('log.type = :type', { type: options.type });
    }
    if (options?.startDate) {
      qb.andWhere('log.datePerformed >= :startDate', {
        startDate: options.startDate,
      });
    }
    if (options?.endDate) {
      qb.andWhere('log.datePerformed <= :endDate', {
        endDate: options.endDate,
      });
    }

    qb.orderBy('log.datePerformed', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [entities, total] = await qb.getManyAndCount();

    return {
      data: entities.map((entity) => MaintenanceLogMapper.toDomain(entity)),
      total,
    };
  }

  async save(log: MaintenanceLog): Promise<MaintenanceLog> {
    const orm = MaintenanceLogMapper.toOrm(log);
    const saved = await this.repository.save(orm);
    return MaintenanceLogMapper.toDomain(saved);
  }
}
