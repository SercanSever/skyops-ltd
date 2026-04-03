import { Drone } from '../../domain/entities/drone.entity';
import { DroneModel } from '../../domain/enums/drone-model.enum';
import { DroneStatus } from '../../domain/enums/drone-status.enum';

export class DroneResponseDto {
  id!: string;
  serialNumber!: string;
  model!: DroneModel;
  status!: DroneStatus;
  totalFlightHours!: number;
  lastMaintenanceDate!: string | null;
  nextMaintenanceDueDate!: string | null;
  createdAt!: string;
  updatedAt!: string;

  static fromDomain(drone: Drone): DroneResponseDto {
    const dto = new DroneResponseDto();
    dto.id = drone.id;
    dto.serialNumber = drone.serialNumber.getValue();
    dto.model = drone.model;
    dto.status = drone.status;
    dto.totalFlightHours = drone.totalFlightHours;
    dto.lastMaintenanceDate = drone.lastMaintenanceDate?.toISOString() ?? null;
    dto.nextMaintenanceDueDate =
      drone.nextMaintenanceDueDate?.toISOString() ?? null;
    dto.createdAt = drone.createdAt.toISOString();
    dto.updatedAt = drone.updatedAt.toISOString();
    return dto;
  }
}
