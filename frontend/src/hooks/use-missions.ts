import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchMissions, fetchMission, createMission, transitionMission } from '@/api/missions';
import type { CreateMissionRequest, TransitionMissionRequest, MissionFilterParams } from '@/types/mission.types';

export function useMissions(params?: MissionFilterParams) {
  return useQuery({
    queryKey: ['missions', params],
    queryFn: () => fetchMissions(params),
  });
}

export function useMission(id: string) {
  return useQuery({
    queryKey: ['missions', id],
    queryFn: () => fetchMission(id),
    enabled: !!id,
  });
}

export function useCreateMission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMissionRequest) => createMission(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['missions'] });
      void queryClient.invalidateQueries({ queryKey: ['fleet-health'] });
    },
  });
}

export function useTransitionMission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TransitionMissionRequest }) => transitionMission(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['missions'] });
      void queryClient.invalidateQueries({ queryKey: ['drones'] });
      void queryClient.invalidateQueries({ queryKey: ['fleet-health'] });
    },
  });
}
