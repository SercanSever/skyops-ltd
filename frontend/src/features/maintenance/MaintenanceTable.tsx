import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useCompleteMaintenance } from "@/hooks/use-maintenance";
import { DroneLink } from "@/features/drones/DroneLink";
import type { MaintenanceLog } from "@/types/maintenance.types";
import type { Drone } from "@/types/drone.types";
import { CheckCircle } from "lucide-react";

interface MaintenanceTableProps {
  logs: MaintenanceLog[];
  droneMap?: Map<string, Drone>;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatType(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

export function MaintenanceTable({ logs, droneMap }: MaintenanceTableProps) {
  const completeMaintenance = useCompleteMaintenance();
  const [confirmLogId, setConfirmLogId] = useState<string | null>(null);

  const confirmLog = confirmLogId
    ? logs.find((l) => l.id === confirmLogId)
    : undefined;

  if (logs.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No maintenance records found.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Drone</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Technician</TableHead>
              <TableHead>Date Performed</TableHead>
              <TableHead className="text-right">Flight Hours</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  <DroneLink
                    droneId={log.droneId}
                    serialNumber={droneMap?.get(log.droneId)?.serialNumber}
                  />
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{formatType(log.type)}</Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {log.technicianName}
                </TableCell>
                <TableCell className="tabular-nums">
                  {formatDate(log.datePerformed)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {log.flightHoursAtMaintenance}h
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">
                  {log.notes ?? "—"}
                </TableCell>
                <TableCell className="text-right">
                  {droneMap?.get(log.droneId)?.status === "MAINTENANCE" ? (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={completeMaintenance.isPending}
                      onClick={() => setConfirmLogId(log.id)}
                    >
                      <CheckCircle className="mr-1 h-3.5 w-3.5" />
                      Complete
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Done</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={!!confirmLogId}
        onOpenChange={(open) => {
          if (!open) setConfirmLogId(null);
        }}
        title="Complete Maintenance"
        description={`Mark maintenance for ${confirmLog ? (droneMap?.get(confirmLog.droneId)?.serialNumber ?? "this drone") : "this drone"} as complete? The drone will become available for missions.`}
        confirmLabel="Complete"
        onConfirm={() => {
          if (confirmLogId) {
            completeMaintenance.mutate(confirmLogId);
            setConfirmLogId(null);
          }
        }}
        isPending={completeMaintenance.isPending}
      />
    </>
  );
}
