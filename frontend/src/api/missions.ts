import { apiGet, apiPost, apiPatch } from "./client";
import type { PaginatedResponse } from "@/types/api.types";
import type {
  Mission,
  CreateMissionRequest,
  TransitionMissionRequest,
  MissionFilterParams,
} from "@/types/mission.types";

export function fetchMissions(
  params?: MissionFilterParams,
): Promise<PaginatedResponse<Mission>> {
  return apiGet<PaginatedResponse<Mission>>(
    "/missions",
    params as Record<string, string>,
  );
}

export function fetchMission(id: string): Promise<Mission> {
  return apiGet<Mission>(`/missions/${id}`);
}

export function createMission(data: CreateMissionRequest): Promise<Mission> {
  return apiPost<Mission>("/missions", data);
}

export function transitionMission(
  id: string,
  data: TransitionMissionRequest,
): Promise<Mission> {
  return apiPatch<Mission>(`/missions/${id}/transition`, data);
}
