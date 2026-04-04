import { apiGet, apiPost, apiPatch } from "./client";
import type { PaginatedResponse } from "@/types/api.types";
import type {
  MaintenanceLog,
  CreateMaintenanceLogRequest,
  MaintenanceFilterParams,
} from "@/types/maintenance.types";

export function fetchMaintenanceLogs(
  params?: MaintenanceFilterParams,
): Promise<PaginatedResponse<MaintenanceLog>> {
  return apiGet<PaginatedResponse<MaintenanceLog>>(
    "/maintenance-logs",
    params as Record<string, string>,
  );
}

export function fetchMaintenanceLog(id: string): Promise<MaintenanceLog> {
  return apiGet<MaintenanceLog>(`/maintenance-logs/${id}`);
}

export function createMaintenanceLog(
  data: CreateMaintenanceLogRequest,
): Promise<MaintenanceLog> {
  return apiPost<MaintenanceLog>("/maintenance-logs", data);
}

export function completeMaintenance(id: string): Promise<MaintenanceLog> {
  return apiPatch<MaintenanceLog>(`/maintenance-logs/${id}/complete`);
}
