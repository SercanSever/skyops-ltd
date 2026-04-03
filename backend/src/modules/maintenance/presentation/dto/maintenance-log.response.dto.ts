import { MaintenanceLog } from '../../domain/entities/maintenance-log.entity';
import { MaintenanceType } from '../../domain/enums/maintenance-type.enum';

export class MaintenanceLogResponseDto {
  id!: string;
  droneId!: string;
  type!: MaintenanceType;
  technicianName!: string;
  notes!: string | null;
  datePerformed!: string;
  flightHoursAtMaintenance!: number;
  createdAt!: string;
  updatedAt!: string;

  static fromDomain(log: MaintenanceLog): MaintenanceLogResponseDto {
    const dto = new MaintenanceLogResponseDto();
    dto.id = log.id;
    dto.droneId = log.droneId;
    dto.type = log.type;
    dto.technicianName = log.technicianName;
    dto.notes = log.notes;
    dto.datePerformed = log.datePerformed.toISOString();
    dto.flightHoursAtMaintenance = log.flightHoursAtMaintenance;
    dto.createdAt = log.createdAt.toISOString();
    dto.updatedAt = log.updatedAt.toISOString();
    return dto;
  }
}
