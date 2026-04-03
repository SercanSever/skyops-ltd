import { Mission } from '../../domain/entities/mission.entity';
import { MissionOrmEntity } from './mission.orm-entity';

export class MissionMapper {
  static toDomain(orm: MissionOrmEntity): Mission {
    return Mission.reconstitute({
      id: orm.id,
      name: orm.name,
      type: orm.type,
      droneId: orm.droneId,
      pilotName: orm.pilotName,
      siteLocation: orm.siteLocation,
      status: orm.status,
      plannedStartTime: orm.plannedStartTime,
      plannedEndTime: orm.plannedEndTime,
      actualStartTime: orm.actualStartTime,
      actualEndTime: orm.actualEndTime,
      flightHours: orm.flightHours ? parseFloat(orm.flightHours) : null,
      abortReason: orm.abortReason,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(domain: Mission): MissionOrmEntity {
    const orm = new MissionOrmEntity();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.type = domain.type;
    orm.droneId = domain.droneId;
    orm.pilotName = domain.pilotName;
    orm.siteLocation = domain.siteLocation;
    orm.status = domain.status;
    orm.plannedStartTime = domain.plannedStartTime;
    orm.plannedEndTime = domain.plannedEndTime;
    orm.actualStartTime = domain.actualStartTime;
    orm.actualEndTime = domain.actualEndTime;
    orm.flightHours = domain.flightHours?.toString() ?? null;
    orm.abortReason = domain.abortReason;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
