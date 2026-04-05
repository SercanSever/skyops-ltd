import { useQuery } from "@tanstack/react-query";
import { fetchDronesByIds } from "@/api/drones";
import type { Drone } from "@/types/drone.types";

export function useDroneMap(droneIds: string[]) {
  const uniqueIds = [...new Set(droneIds)].sort();

  return useQuery({
    queryKey: ["drones", "batch", uniqueIds],
    queryFn: () => fetchDronesByIds(uniqueIds),
    enabled: uniqueIds.length > 0,
    select: (drones: Drone[]) => {
      const map = new Map<string, Drone>();
      for (const drone of drones) {
        map.set(drone.id, drone);
      }
      return map;
    },
  });
}
