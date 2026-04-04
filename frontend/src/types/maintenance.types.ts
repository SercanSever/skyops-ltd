export type MaintenanceType =
  | "ROUTINE_CHECK"
  | "BATTERY_REPLACEMENT"
  | "MOTOR_REPAIR"
  | "FIRMWARE_UPDATE"
  | "FULL_OVERHAUL";

export interface MaintenanceLog {
  id: string;
  droneId: string;
  type: MaintenanceType;
  technicianName: string;
  notes: string | null;
  datePerformed: string;
  flightHoursAtMaintenance: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaintenanceLogRequest {
  droneId: string;
  type: MaintenanceType;
  technicianName: string;
  notes?: string;
  datePerformed: string;
  flightHoursAtMaintenance: number;
}

export interface MaintenanceFilterParams {
  page?: number;
  limit?: number;
  droneId?: string;
  type?: MaintenanceType;
  startDate?: string;
  endDate?: string;
}
