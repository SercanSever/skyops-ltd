import { apiGet } from "./client";

export interface FleetHealthReport {
  totalDrones: number;
  dronesByStatus: Record<string, number>;
  overdueMaintenanceDrones: Array<{
    id: string;
    serialNumber: string;
    model: string;
    nextMaintenanceDueDate: string;
  }>;
  missionsNext24Hours: number;
  averageFlightHours: number;
}

export function fetchFleetHealth(): Promise<FleetHealthReport> {
  return apiGet<FleetHealthReport>("/fleet-health");
}
