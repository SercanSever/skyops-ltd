import { Mission } from '../../domain/entities/mission.entity';
import { MissionStatus } from '../../domain/enums/mission-status.enum';
import { MissionType } from '../../domain/enums/mission-type.enum';

export class MissionResponseDto {
  id!: string;
  name!: string;
  type!: MissionType;
  droneId!: string;
  pilotName!: string;
  siteLocation!: string;
  status!: MissionStatus;
  plannedStartTime!: string;
  plannedEndTime!: string;
  actualStartTime!: string | null;
  actualEndTime!: string | null;
  flightHours!: number | null;
  abortReason!: string | null;
  createdAt!: string;
  updatedAt!: string;

  static fromDomain(mission: Mission): MissionResponseDto {
    const dto = new MissionResponseDto();
    dto.id = mission.id;
    dto.name = mission.name;
    dto.type = mission.type;
    dto.droneId = mission.droneId;
    dto.pilotName = mission.pilotName;
    dto.siteLocation = mission.siteLocation;
    dto.status = mission.status;
    dto.plannedStartTime = mission.plannedStartTime.toISOString();
    dto.plannedEndTime = mission.plannedEndTime.toISOString();
    dto.actualStartTime = mission.actualStartTime?.toISOString() ?? null;
    dto.actualEndTime = mission.actualEndTime?.toISOString() ?? null;
    dto.flightHours = mission.flightHours;
    dto.abortReason = mission.abortReason;
    dto.createdAt = mission.createdAt.toISOString();
    dto.updatedAt = mission.updatedAt.toISOString();
    return dto;
  }
}
