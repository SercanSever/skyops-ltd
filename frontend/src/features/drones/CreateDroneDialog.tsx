import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateDrone } from "@/hooks/use-drones";
import type { DroneModel } from "@/types/drone.types";
import { Plus } from "lucide-react";

const MODELS: { value: DroneModel; label: string }[] = [
  { value: "PHANTOM_4", label: "Phantom 4" },
  { value: "MATRICE_300", label: "Matrice 300" },
  { value: "MAVIC_3_ENTERPRISE", label: "Mavic 3 Enterprise" },
];

const SERIAL_REGEX = /^SKY-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

export function CreateDroneDialog() {
  const [open, setOpen] = useState(false);
  const [serialNumber, setSerialNumber] = useState("");
  const [model, setModel] = useState<DroneModel>("PHANTOM_4");
  const [error, setError] = useState("");

  const createDrone = useCreateDrone();

  function resetForm() {
    setSerialNumber("");
    setModel("PHANTOM_4");
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!SERIAL_REGEX.test(serialNumber)) {
      setError("Format: SKY-XXXX-XXXX (X = A-Z, 0-9)");
      return;
    }

    try {
      await createDrone.mutateAsync({ serialNumber, model });
      resetForm();
      setOpen(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create drone";
      setError(message);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" />
        New Drone
      </Button>

      <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/50" />
          <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 shadow-lg">
            <DialogPrimitive.Title className="text-lg font-semibold">
              Create New Drone
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="mt-1 text-sm text-muted-foreground">
              Register a new drone in the fleet.
            </DialogPrimitive.Description>

            <form
              onSubmit={(e) => void handleSubmit(e)}
              className="mt-4 space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">Serial Number</label>
                <Input
                  placeholder="SKY-XXXX-XXXX"
                  value={serialNumber}
                  onChange={(e) =>
                    setSerialNumber(e.target.value.toUpperCase())
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value as DroneModel)}
                  className="flex h-9 w-full rounded-md border bg-background px-3 text-sm"
                >
                  {MODELS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
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
                <Button type="submit" disabled={createDrone.isPending}>
                  {createDrone.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </form>
          </DialogPrimitive.Popup>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
