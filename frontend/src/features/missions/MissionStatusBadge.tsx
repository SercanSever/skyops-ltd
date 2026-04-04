import { Badge } from "@/components/ui/badge";
import type { MissionStatus } from "@/types/mission.types";

const STATUS_STYLES: Record<
  MissionStatus,
  { label: string; className: string }
> = {
  PLANNED: {
    label: "Planned",
    className: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  },
  PRE_FLIGHT_CHECK: {
    label: "Pre-Flight",
    className: "bg-violet-50 text-violet-700 ring-1 ring-violet-200",
  },
  IN_PROGRESS: {
    label: "In Progress",
    className: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  },
  ABORTED: {
    label: "Aborted",
    className: "bg-destructive/10 text-destructive ring-1 ring-destructive/20",
  },
};

interface MissionStatusBadgeProps {
  status: MissionStatus;
}

export function MissionStatusBadge({ status }: MissionStatusBadgeProps) {
  const style = STATUS_STYLES[status];
  return (
    <Badge variant="secondary" className={style.className}>
      {style.label}
    </Badge>
  );
}
