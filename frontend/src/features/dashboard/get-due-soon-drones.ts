import type { Drone } from "@/types/drone.types";

export function getDueSoonDrones(
  drones: Drone[],
  overdueIds: Set<string>,
): Array<{
  id: string;
  serialNumber: string;
  model: string;
  nextMaintenanceDueDate: string;
}> {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  return drones
    .filter(
      (d) =>
        d.nextMaintenanceDueDate &&
        !overdueIds.has(d.id) &&
        d.status !== "RETIRED" &&
        new Date(d.nextMaintenanceDueDate).getTime() > now.getTime() &&
        new Date(d.nextMaintenanceDueDate).getTime() <=
          sevenDaysFromNow.getTime(),
    )
    .map((d) => ({
      id: d.id,
      serialNumber: d.serialNumber,
      model: d.model,
      nextMaintenanceDueDate: d.nextMaintenanceDueDate!,
    }));
}
