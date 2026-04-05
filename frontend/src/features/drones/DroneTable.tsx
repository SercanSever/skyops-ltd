import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DroneStatusBadge } from "./DroneStatusBadge";
import { formatModel } from "./format-model";
import type { Drone } from "@/types/drone.types";
import { Target, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface DroneTableProps {
  drones: Drone[];
  onPlanMission?: (droneId: string) => void;
  onSendToMaintenance?: (droneId: string) => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdue(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

function daysUntilMaintenance(iso: string | null): string {
  if (!iso) return "";
  const days = Math.ceil(
    (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Today";
  return `${days}d`;
}

export function DroneTable({
  drones,
  onPlanMission,
  onSendToMaintenance,
}: DroneTableProps) {
  const navigate = useNavigate();

  if (drones.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-sm text-muted-foreground">No drones found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Serial Number</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Flight Hours</TableHead>
            <TableHead>Next Maintenance</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drones.map((drone) => (
            <TableRow
              key={drone.id}
              className="cursor-pointer"
              onClick={() => navigate(`/drones/${drone.id}`)}
            >
              <TableCell className="font-medium">
                {drone.serialNumber}
              </TableCell>
              <TableCell>{formatModel(drone.model)}</TableCell>
              <TableCell>
                <DroneStatusBadge status={drone.status} />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {drone.totalFlightHours}h
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      isOverdue(drone.nextMaintenanceDueDate)
                        ? "text-destructive font-medium"
                        : "",
                    )}
                  >
                    {formatDate(drone.nextMaintenanceDueDate)}
                  </span>
                  {drone.nextMaintenanceDueDate && (
                    <span
                      className={cn(
                        "text-xs tabular-nums",
                        isOverdue(drone.nextMaintenanceDueDate)
                          ? "text-destructive"
                          : "text-muted-foreground",
                      )}
                    >
                      ({daysUntilMaintenance(drone.nextMaintenanceDueDate)})
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {drone.status === "AVAILABLE" && (
                  <div
                    className="flex items-center justify-end gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {onPlanMission && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPlanMission(drone.id)}
                      >
                        <Target className="mr-1 h-3.5 w-3.5" />
                        Mission
                      </Button>
                    )}
                    {onSendToMaintenance && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSendToMaintenance(drone.id)}
                      >
                        <Wrench className="mr-1 h-3.5 w-3.5" />
                        Maintain
                      </Button>
                    )}
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
