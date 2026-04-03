import { MaintenanceLog } from '../../domain/entities/maintenance-log.entity';
import { MaintenanceLogOrmEntity } from './maintenance-log.orm-entity';

export class MaintenanceLogMapper {
  static toDomain(orm: MaintenanceLogOrmEntity): MaintenanceLog {
    return MaintenanceLog.reconstitute({
      id: orm.id,
      droneId: orm.droneId,
      type: orm.type,
      technicianName: orm.technicianName,
      notes: orm.notes,
      datePerformed: orm.datePerformed,
      flightHoursAtMaintenance: parseFloat(orm.flightHoursAtMaintenance),
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(domain: MaintenanceLog): MaintenanceLogOrmEntity {
    const orm = new MaintenanceLogOrmEntity();
    orm.id = domain.id;
    orm.droneId = domain.droneId;
    orm.type = domain.type;
    orm.technicianName = domain.technicianName;
    orm.notes = domain.notes;
    orm.datePerformed = domain.datePerformed;
    orm.flightHoursAtMaintenance = domain.flightHoursAtMaintenance.toString();
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
