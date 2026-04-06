import { useDrones } from "@/hooks/use-drones";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import type { MissionStatus } from "@/types/mission.types";

interface MissionFiltersProps {
  status: string | undefined;
  droneId: string | undefined;
  startDate: string | undefined;
  endDate: string | undefined;
  onStatusChange: (status: string | undefined) => void;
  onDroneIdChange: (droneId: string | undefined) => void;
  onStartDateChange: (date: string | undefined) => void;
  onEndDateChange: (date: string | undefined) => void;
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
  droneId,
  startDate,
  endDate,
  onStatusChange,
  onDroneIdChange,
  onStartDateChange,
  onEndDateChange,
}: MissionFiltersProps) {
  const { data: dronesData } = useDrones({ limit: 100 });

  const hasActiveFilters =
    status !== undefined ||
    droneId !== undefined ||
    startDate !== undefined ||
    endDate !== undefined;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={status ?? ""}
        onChange={(e) =>
          onStatusChange(
            e.target.value || undefined,
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

      <select
        value={droneId ?? ""}
        onChange={(e) => onDroneIdChange(e.target.value || undefined)}
        className="h-9 rounded-md border bg-background px-3 text-sm text-foreground"
      >
        <option value="">All Drones</option>
        {dronesData?.data.map((d) => (
          <option key={d.id} value={d.id}>
            {d.serialNumber}
          </option>
        ))}
      </select>

      <div className="flex items-center gap-1.5">
        <label className="text-xs text-muted-foreground whitespace-nowrap">Plan Start</label>
        <Input
          type="date"
          value={startDate?.split("T")[0] ?? ""}
          onChange={(e) => onStartDateChange(e.target.value || undefined)}
          className="h-9 w-auto"
        />
      </div>

      <div className="flex items-center gap-1.5">
        <label className="text-xs text-muted-foreground whitespace-nowrap">Plan End</label>
        <Input
          type="date"
          value={endDate?.split("T")[0] ?? ""}
          onChange={(e) => onEndDateChange(e.target.value || undefined)}
          className="h-9 w-auto"
        />
      </div>

      {hasActiveFilters && (
        <button
          onClick={() => {
            onStatusChange(undefined);
            onDroneIdChange(undefined);
            onStartDateChange(undefined);
            onEndDateChange(undefined);
          }}
          className="flex h-9 items-center gap-1 rounded-md border border-dashed px-3 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-3 w-3" />
          Reset
        </button>
      )}
    </div>
  );
}
