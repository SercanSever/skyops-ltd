import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateMaintenanceLog } from "@/hooks/use-maintenance";
import { useDrones } from "@/hooks/use-drones";
import type { MaintenanceType } from "@/types/maintenance.types";
import { Plus } from "lucide-react";

const MAINTENANCE_TYPES: { value: MaintenanceType; label: string }[] = [
  { value: "ROUTINE_CHECK", label: "Routine Check" },
  { value: "BATTERY_REPLACEMENT", label: "Battery Replacement" },
  { value: "MOTOR_REPAIR", label: "Motor Repair" },
  { value: "FIRMWARE_UPDATE", label: "Firmware Update" },
  { value: "FULL_OVERHAUL", label: "Full Overhaul" },
];

export function CreateMaintenanceDialog() {
  const [open, setOpen] = useState(false);
  const [droneId, setDroneId] = useState("");
  const [type, setType] = useState<MaintenanceType>("ROUTINE_CHECK");
  const [technicianName, setTechnicianName] = useState("");
  const [notes, setNotes] = useState("");
  const [datePerformed, setDatePerformed] = useState("");
  const [flightHoursAtMaintenance, setFlightHoursAtMaintenance] = useState("");
  const [error, setError] = useState("");

  const createLog = useCreateMaintenanceLog();
  const { data: dronesData } = useDrones({ limit: 100 });

  const selectedDrone = dronesData?.data.find((d) => d.id === droneId);

  function resetForm() {
    setDroneId("");
    setType("ROUTINE_CHECK");
    setTechnicianName("");
    setNotes("");
    setDatePerformed("");
    setFlightHoursAtMaintenance("");
    setError("");
  }

  function handleDroneChange(id: string) {
    setDroneId(id);
    const drone = dronesData?.data.find((d) => d.id === id);
    if (drone) {
      setFlightHoursAtMaintenance(drone.totalFlightHours.toString());
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!droneId || !technicianName || !datePerformed) {
      setError("Drone, technician name, and date are required");
      return;
    }

    const hours = parseFloat(flightHoursAtMaintenance);
    if (isNaN(hours) || hours < 0) {
      setError("Flight hours must be a non-negative number");
      return;
    }

    try {
      await createLog.mutateAsync({
        droneId,
        type,
        technicianName,
        notes: notes || undefined,
        datePerformed: new Date(datePerformed).toISOString(),
        flightHoursAtMaintenance: hours,
      });
      resetForm();
      setOpen(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create maintenance log",
      );
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        New Maintenance Log
      </Button>

      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50" />
          <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <DialogPrimitive.Title className="text-lg font-semibold">
              Create Maintenance Log
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mt-1 text-sm text-muted-foreground">
              Record a maintenance operation. The drone status will change to
              MAINTENANCE.
            </DialogPrimitive.Description>

            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="mt-4 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Drone</label>
                  <select
                    value={droneId}
                    onChange={(e) => handleDroneChange(e.target.value)}
                    className="flex h-9 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="">Select drone...</option>
                    {dronesData?.data
                      .filter(
                        (d) =>
                          d.status !== "IN_MISSION" && d.status !== "RETIRED",
                      )
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.serialNumber} ({d.totalFlightHours}h)
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as MaintenanceType)}
                    className="flex h-9 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    {MAINTENANCE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Technician Name</label>
                  <Input
                    placeholder="Alex Smith"
                    value={technicianName}
                    onChange={(e) => setTechnicianName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Performed</label>
                  <Input
                    type="datetime-local"
                    value={datePerformed}
                    onChange={(e) => setDatePerformed(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Flight Hours at Maintenance
                  {selectedDrone && (
                    <span className="ml-1 font-normal text-muted-foreground">
                      (drone: {selectedDrone.totalFlightHours}h)
                    </span>
                  )}
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 25.5"
                  value={flightHoursAtMaintenance}
                  onChange={(e) => setFlightHoursAtMaintenance(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes (optional)</label>
                <Input
                  placeholder="Maintenance notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
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
                <Button type="submit" disabled={createLog.isPending}>
                  {createLog.isPending ? "Creating..." : "Create Log"}
                </Button>
              </div>
            </form>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
