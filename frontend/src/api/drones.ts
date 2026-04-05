import { apiGet, apiPost, apiPatch, apiDelete } from "./client";
import type { PaginatedResponse } from "@/types/api.types";
import type {
  Drone,
  CreateDroneRequest,
  UpdateDroneRequest,
  DroneFilterParams,
} from "@/types/drone.types";

export function fetchDrones(
  params?: DroneFilterParams,
): Promise<PaginatedResponse<Drone>> {
  return apiGet<PaginatedResponse<Drone>>(
    "/drones",
    params as Record<string, string>,
  );
}

export function fetchDrone(id: string): Promise<Drone> {
  return apiGet<Drone>(`/drones/${id}`);
}

export function fetchDronesByIds(ids: string[]): Promise<Drone[]> {
  if (ids.length === 0) return Promise.resolve([]);
  return apiGet<Drone[]>("/drones/batch", { ids: ids.join(",") });
}

export function createDrone(data: CreateDroneRequest): Promise<Drone> {
  return apiPost<Drone>("/drones", data);
}

export function updateDrone(
  id: string,
  data: UpdateDroneRequest,
): Promise<Drone> {
  return apiPatch<Drone>(`/drones/${id}`, data);
}

export function retireDrone(id: string): Promise<Drone> {
  return apiPatch<Drone>(`/drones/${id}/retire`);
}

export function deleteDrone(id: string): Promise<void> {
  return apiDelete(`/drones/${id}`);
}
