import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateMission } from "@/hooks/use-missions";
import { useDrones } from "@/hooks/use-drones";
import type { MissionType } from "@/types/mission.types";
import { Plus } from "lucide-react";

const MISSION_TYPES: { value: MissionType; label: string }[] = [
  { value: "WIND_TURBINE_INSPECTION", label: "Wind Turbine Inspection" },
  { value: "SOLAR_PANEL_SURVEY", label: "Solar Panel Survey" },
  { value: "POWER_LINE_PATROL", label: "Power Line Patrol" },
];

interface CreateMissionDialogProps {
  defaultDroneId?: string;
  autoOpen?: boolean;
  onAutoOpenHandled?: () => void;
}

export function CreateMissionDialog({
  defaultDroneId,
  autoOpen,
  onAutoOpenHandled,
}: CreateMissionDialogProps = {}) {
  const [open, setOpen] = useState(autoOpen ?? false);
  const [name, setName] = useState("");
  const [type, setType] = useState<MissionType>("WIND_TURBINE_INSPECTION");
  const [droneId, setDroneId] = useState(defaultDroneId ?? "");
  const [pilotName, setPilotName] = useState("");
  const [siteLocation, setSiteLocation] = useState("");
  const [plannedStartTime, setPlannedStartTime] = useState("");
  const [plannedEndTime, setPlannedEndTime] = useState("");
  const [error, setError] = useState("");

  const createMission = useCreateMission();
  const { data: dronesData, refetch: refetchDrones } = useDrones({
    status: "AVAILABLE",
    limit: 100,
  });

  function resetForm() {
    setName("");
    setType("WIND_TURBINE_INSPECTION");
    setDroneId("");
    setPilotName("");
    setSiteLocation("");
    setPlannedStartTime("");
    setPlannedEndTime("");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (
      !name ||
      !droneId ||
      !pilotName ||
      !siteLocation ||
      !plannedStartTime ||
      !plannedEndTime
    ) {
      setError("All fields are required");
      return;
    }

    if (new Date(plannedStartTime).getTime() <= Date.now()) {
      setError("Planned start time must be in the future");
      return;
    }

    if (
      new Date(plannedEndTime).getTime() <= new Date(plannedStartTime).getTime()
    ) {
      setError("Planned end time must be after start time");
      return;
    }

    try {
      await createMission.mutateAsync({
        name,
        type,
        droneId,
        pilotName,
        siteLocation,
        plannedStartTime: new Date(plannedStartTime).toISOString(),
        plannedEndTime: new Date(plannedEndTime).toISOString(),
      });
      resetForm();
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create mission");
    }
  }

  return (
    <>
      <Button
        onClick={() => {
          void refetchDrones();
          setOpen(true);
        }}
      >
        <Plus className="mr-2 h-4 w-4" />
        New Mission
      </Button>

      <DialogPrimitive.Root
        open={open}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) onAutoOpenHandled?.();
        }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50" />
          <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <DialogPrimitive.Title className="text-lg font-semibold">
              Create New Mission
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mt-1 text-sm text-muted-foreground">
              Schedule a new drone mission.
            </DialogPrimitive.Description>

            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="mt-4 space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">Mission Name</label>
                <Input
                  placeholder="Wind Farm Alpha Inspection"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as MissionType)}
                    className="flex h-9 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    {MISSION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Drone (Available)
                  </label>
                  <select
                    value={droneId}
                    onChange={(e) => setDroneId(e.target.value)}
                    className="flex h-9 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="">Select drone...</option>
                    {dronesData?.data.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.serialNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Pilot Name</label>
                  <Input
                    placeholder="John Doe"
                    value={pilotName}
                    onChange={(e) => setPilotName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Site Location</label>
                  <Input
                    placeholder="Wind Farm Alpha"
                    value={siteLocation}
                    onChange={(e) => setSiteLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Planned Start</label>
                  <Input
                    type="datetime-local"
                    value={plannedStartTime}
                    onChange={(e) => setPlannedStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Planned End</label>
                  <Input
                    type="datetime-local"
                    value={plannedEndTime}
                    onChange={(e) => setPlannedEndTime(e.target.value)}
                  />
                </div>
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMission.isPending}>
                  {createMission.isPending ? "Creating..." : "Create Mission"}
                </Button>
              </div>
            </form>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
