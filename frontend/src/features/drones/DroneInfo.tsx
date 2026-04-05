import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { DroneStatusBadge } from "./DroneStatusBadge";
import { formatModel } from "./format-model";
import { useRetireDrone, useDeleteDrone } from "@/hooks/use-drones";
import type { Drone } from "@/types/drone.types";
import { Plane, PowerOff, Trash2 } from "lucide-react";

interface DroneInfoProps {
  drone: Drone;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DroneInfo({ drone }: DroneInfoProps) {
  const navigate = useNavigate();
  const retireDrone = useRetireDrone();
  const deleteDrone = useDeleteDrone();
  const [retireError, setRetireError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [showRetireConfirm, setShowRetireConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const canDelete = drone.status === "AVAILABLE" || drone.status === "RETIRED";

  async function handleRetire() {
    setRetireError("");
    try {
      await retireDrone.mutateAsync(drone.id);
      setShowRetireConfirm(false);
    } catch (err) {
      setRetireError(
        err instanceof Error ? err.message : "Failed to retire drone",
      );
      setShowRetireConfirm(false);
    }
  }

  async function handleDelete() {
    setDeleteError("");
    try {
      await deleteDrone.mutateAsync(drone.id);
      setShowDeleteConfirm(false);
      navigate("/drones");
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "Failed to delete drone",
      );
      setShowDeleteConfirm(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              {drone.serialNumber}
            </div>
            <DroneStatusBadge status={drone.status} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <InfoItem label="Model" value={formatModel(drone.model)} />
            <InfoItem
              label="Total Flight Hours"
              value={`${drone.totalFlightHours}h`}
            />
            <InfoItem
              label="Last Maintenance"
              value={formatDate(drone.lastMaintenanceDate)}
            />
            <InfoItem
              label="Next Maintenance"
              value={formatDate(drone.nextMaintenanceDueDate)}
            />
            <InfoItem label="Registered" value={formatDate(drone.createdAt)} />
            <InfoItem
              label="Last Updated"
              value={formatDate(drone.updatedAt)}
            />
          </div>

          {(drone.status === "AVAILABLE" || canDelete) && (
            <>
              <Separator />
              {retireError && (
                <p className="text-sm text-destructive">{retireError}</p>
              )}
              {deleteError && (
                <p className="text-sm text-destructive">{deleteError}</p>
              )}
              <div className="flex justify-end gap-2">
                {canDelete && (
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deleteDrone.isPending}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                )}
                {drone.status === "AVAILABLE" && (
                  <Button
                    variant="outline"
                    onClick={() => setShowRetireConfirm(true)}
                    disabled={retireDrone.isPending}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <PowerOff className="mr-2 h-4 w-4" />
                    Retire
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={showRetireConfirm}
        onOpenChange={setShowRetireConfirm}
        title="Retire Drone"
        description={`Are you sure you want to retire ${drone.serialNumber}? This action cannot be undone. The drone will no longer be available for missions.`}
        confirmLabel="Retire"
        variant="destructive"
        onConfirm={() => void handleRetire()}
        isPending={retireDrone.isPending}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Drone"
        description={`Are you sure you want to permanently delete ${drone.serialNumber}? This will remove all associated data and cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => void handleDelete()}
        isPending={deleteDrone.isPending}
      />
    </>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}
