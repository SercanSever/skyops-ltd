import { X } from "lucide-react";
import type { DroneStatus, DroneModel } from "@/types/drone.types";

interface DroneFiltersProps {
  status: DroneStatus | undefined;
  model: DroneModel | undefined;
  onStatusChange: (status: DroneStatus | undefined) => void;
  onModelChange: (model: DroneModel | undefined) => void;
}

const STATUSES: { value: DroneStatus; label: string }[] = [
  { value: "AVAILABLE", label: "Available" },
  { value: "IN_MISSION", label: "In Mission" },
  { value: "MAINTENANCE", label: "Maintenance" },
  { value: "RETIRED", label: "Retired" },
];

const MODELS: { value: DroneModel; label: string }[] = [
  { value: "PHANTOM_4", label: "Phantom 4" },
  { value: "MATRICE_300", label: "Matrice 300" },
  { value: "MAVIC_3_ENTERPRISE", label: "Mavic 3 Enterprise" },
];

export function DroneFilters({
  status,
  model,
  onStatusChange,
  onModelChange,
}: DroneFiltersProps) {
  const hasActiveFilters = status !== undefined || model !== undefined;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={status ?? ""}
        onChange={(e) =>
          onStatusChange(
            (e.target.value || undefined) as DroneStatus | undefined,
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
        value={model ?? ""}
        onChange={(e) =>
          onModelChange((e.target.value || undefined) as DroneModel | undefined)
        }
        className="h-9 rounded-md border bg-background px-3 text-sm text-foreground"
      >
        <option value="">All Models</option>
        {MODELS.map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </select>

      {hasActiveFilters && (
        <button
          onClick={() => {
            onStatusChange(undefined);
            onModelChange(undefined);
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
