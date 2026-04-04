import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { DroneStatusBadge } from "./DroneStatusBadge";
import { formatModel } from "./format-model";
import { useRetireDrone } from "@/hooks/use-drones";
import type { Drone } from "@/types/drone.types";
import { Plane, PowerOff } from "lucide-react";

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
  const retireDrone = useRetireDrone();

  function handleRetire() {
    if (confirm("Are you sure you want to retire this drone?")) {
      retireDrone.mutate(drone.id);
    }
  }

  return (
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
          <InfoItem label="Last Updated" value={formatDate(drone.updatedAt)} />
        </div>

        {drone.status === "AVAILABLE" && (
          <>
            <Separator />
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={handleRetire}
                disabled={retireDrone.isPending}
                className="text-destructive hover:bg-destructive/10"
              >
                <PowerOff className="mr-2 h-4 w-4" />
                {retireDrone.isPending ? "Retiring..." : "Retire Drone"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
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
