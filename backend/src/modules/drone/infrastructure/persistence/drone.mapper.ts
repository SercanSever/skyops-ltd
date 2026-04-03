import { Drone } from '../../domain/entities/drone.entity';
import { SerialNumber } from '../../domain/value-objects/serial-number.vo';
import { DroneOrmEntity } from './drone.orm-entity';

export class DroneMapper {
  static toDomain(orm: DroneOrmEntity): Drone {
    return Drone.reconstitute({
      id: orm.id,
      serialNumber: SerialNumber.create(orm.serialNumber),
      model: orm.model,
      status: orm.status,
      totalFlightHours: parseFloat(orm.totalFlightHours),
      lastMaintenanceDate: orm.lastMaintenanceDate,
      nextMaintenanceDueDate: orm.nextMaintenanceDueDate,
      createdAt: orm.createdAt,
      updatedAt: orm.updatedAt,
    });
  }

  static toOrm(domain: Drone): DroneOrmEntity {
    const orm = new DroneOrmEntity();
    orm.id = domain.id;
    orm.serialNumber = domain.serialNumber.getValue();
    orm.model = domain.model;
    orm.status = domain.status;
    orm.totalFlightHours = domain.totalFlightHours.toString();
    orm.lastMaintenanceDate = domain.lastMaintenanceDate;
    orm.nextMaintenanceDueDate = domain.nextMaintenanceDueDate;
    orm.createdAt = domain.createdAt;
    orm.updatedAt = domain.updatedAt;
    return orm;
  }
}
