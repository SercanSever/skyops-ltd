export type DroneStatus = 'AVAILABLE' | 'IN_MISSION' | 'MAINTENANCE' | 'RETIRED';
export type DroneModel = 'PHANTOM_4' | 'MATRICE_300' | 'MAVIC_3_ENTERPRISE';

export interface Drone {
  id: string;
  serialNumber: string;
  model: DroneModel;
  status: DroneStatus;
  totalFlightHours: number;
  lastMaintenanceDate: string | null;
  nextMaintenanceDueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDroneRequest {
  serialNumber: string;
  model: DroneModel;
}

export interface UpdateDroneRequest {
  model?: DroneModel;
}

export interface DroneFilterParams {
  page?: number;
  limit?: number;
  status?: DroneStatus;
  model?: DroneModel;
}
