import { useQuery } from "@tanstack/react-query";
import { fetchFleetHealth } from "@/api/fleet-health";

export function useFleetHealth() {
  return useQuery({
    queryKey: ["fleet-health"],
    queryFn: fetchFleetHealth,
    refetchInterval: 60_000,
  });
}
