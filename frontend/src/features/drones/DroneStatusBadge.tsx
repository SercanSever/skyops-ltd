import { Badge } from "@/components/ui/badge";
import type { DroneStatus } from "@/types/drone.types";

const STATUS_STYLES: Record<DroneStatus, { label: string; className: string }> =
  {
    AVAILABLE: {
      label: "Available",
      className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    },
    IN_MISSION: {
      label: "In Mission",
      className: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    },
    MAINTENANCE: {
      label: "Maintenance",
      className: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    },
    RETIRED: {
      label: "Retired",
      className: "bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200",
    },
  };

interface DroneStatusBadgeProps {
  status: DroneStatus;
}

export function DroneStatusBadge({ status }: DroneStatusBadgeProps) {
  const style = STATUS_STYLES[status];
  return (
    <Badge variant="secondary" className={style.className}>
      {style.label}
    </Badge>
  );
}
