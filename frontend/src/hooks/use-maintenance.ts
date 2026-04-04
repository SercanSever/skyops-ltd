import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchMaintenanceLogs,
  fetchMaintenanceLog,
  createMaintenanceLog,
  completeMaintenance,
} from "@/api/maintenance";
import type {
  CreateMaintenanceLogRequest,
  MaintenanceFilterParams,
} from "@/types/maintenance.types";

export function useMaintenanceLogs(params?: MaintenanceFilterParams) {
  return useQuery({
    queryKey: ["maintenance-logs", params],
    queryFn: () => fetchMaintenanceLogs(params),
  });
}

export function useMaintenanceLog(id: string) {
  return useQuery({
    queryKey: ["maintenance-logs", id],
    queryFn: () => fetchMaintenanceLog(id),
    enabled: !!id,
  });
}

export function useCreateMaintenanceLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMaintenanceLogRequest) =>
      createMaintenanceLog(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["maintenance-logs"] });
      void queryClient.invalidateQueries({ queryKey: ["drones"] });
      void queryClient.invalidateQueries({ queryKey: ["fleet-health"] });
    },
  });
}

export function useCompleteMaintenance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => completeMaintenance(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["maintenance-logs"] });
      void queryClient.invalidateQueries({ queryKey: ["drones"] });
      void queryClient.invalidateQueries({ queryKey: ["fleet-health"] });
    },
  });
}
