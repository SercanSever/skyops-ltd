import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchDrones, fetchDrone, createDrone, updateDrone, retireDrone, deleteDrone } from '@/api/drones';
import type { CreateDroneRequest, UpdateDroneRequest, DroneFilterParams } from '@/types/drone.types';

export function useDrones(params?: DroneFilterParams) {
  return useQuery({
    queryKey: ['drones', params],
    queryFn: () => fetchDrones(params),
  });
}

export function useDrone(id: string) {
  return useQuery({
    queryKey: ['drones', id],
    queryFn: () => fetchDrone(id),
    enabled: !!id,
  });
}

export function useCreateDrone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDroneRequest) => createDrone(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['drones'] });
      void queryClient.invalidateQueries({ queryKey: ['fleet-health'] });
    },
  });
}

export function useUpdateDrone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDroneRequest }) => updateDrone(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['drones'] });
    },
  });
}

export function useRetireDrone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => retireDrone(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['drones'] });
      void queryClient.invalidateQueries({ queryKey: ['fleet-health'] });
    },
  });
}

export function useDeleteDrone() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDrone(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['drones'] });
      void queryClient.invalidateQueries({ queryKey: ['fleet-health'] });
    },
  });
}
