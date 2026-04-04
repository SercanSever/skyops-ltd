import { useDrones } from "@/hooks/use-drones";
import { Input } from "@/components/ui/input";
import type { MissionStatus } from "@/types/mission.types";

interface MissionFiltersProps {
  status: MissionStatus | undefined;
  droneId: string | undefined;
  startDate: string | undefined;
  endDate: string | undefined;
  onStatusChange: (status: MissionStatus | undefined) => void;
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

      <Input
        type="date"
        value={startDate ?? ""}
        onChange={(e) => onStartDateChange(e.target.value || undefined)}
        className="h-9 w-auto"
        placeholder="Start date"
      />

      <Input
        type="date"
        value={endDate ?? ""}
        onChange={(e) => onEndDateChange(e.target.value || undefined)}
        className="h-9 w-auto"
        placeholder="End date"
      />
    </div>
  );
}
