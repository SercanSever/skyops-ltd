export type MissionStatus =
  | "PLANNED"
  | "PRE_FLIGHT_CHECK"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ABORTED";
export type MissionType =
  | "WIND_TURBINE_INSPECTION"
  | "SOLAR_PANEL_SURVEY"
  | "POWER_LINE_PATROL";

export interface Mission {
  id: string;
  name: string;
  type: MissionType;
  droneId: string;
  pilotName: string;
  siteLocation: string;
  status: MissionStatus;
  plannedStartTime: string;
  plannedEndTime: string;
  actualStartTime: string | null;
  actualEndTime: string | null;
  flightHours: number | null;
  abortReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMissionRequest {
  name: string;
  type: MissionType;
  droneId: string;
  pilotName: string;
  siteLocation: string;
  plannedStartTime: string;
  plannedEndTime: string;
}

export interface TransitionMissionRequest {
  status: MissionStatus;
  flightHours?: number;
  abortReason?: string;
}

export interface MissionFilterParams {
  page?: number;
  limit?: number;
  status?: MissionStatus | string;
  droneId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "plannedStartTime" | "createdAt";
  sortOrder?: "ASC" | "DESC";
}
