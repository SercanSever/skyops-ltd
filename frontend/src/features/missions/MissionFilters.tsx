import type { MissionStatus } from "@/types/mission.types";

interface MissionFiltersProps {
  status: MissionStatus | undefined;
  onStatusChange: (status: MissionStatus | undefined) => void;
}

const STATUSES: { value: MissionStatus; label: string }[] = [
  { value: "PLANNED", label: "Planned" },
  { value: "PRE_FLIGHT_CHECK", label: "Pre-Flight Check" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ABORTED", label: "Aborted" },
];

export function MissionFilters({
  status,
  onStatusChange,
}: MissionFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={status ?? ""}
        onChange={(e) =>
          onStatusChange(
            (e.target.value || undefined) as MissionStatus | undefined,
          )
        }
        className="h-9 rounded-md border bg-background px-3 text-sm text-foreground"
      >
        <option value="">All Statuses</option>
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
