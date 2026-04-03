import { MissionStatus } from '../../domain/enums/mission-status.enum';

export interface TransitionMissionInput {
  status: MissionStatus;
  flightHours?: number;
  abortReason?: string;
}
