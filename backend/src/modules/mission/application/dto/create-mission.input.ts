import { MissionType } from '../../domain/enums/mission-type.enum';

export interface CreateMissionInput {
  name: string;
  type: MissionType;
  droneId: string;
  pilotName: string;
  siteLocation: string;
  plannedStartTime: Date;
  plannedEndTime: Date;
}
