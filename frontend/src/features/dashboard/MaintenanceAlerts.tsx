import { useState } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FleetHealthReport } from "@/api/fleet-health";
import { Wrench } from "lucide-react";

interface MaintenanceAlertsProps {
  overdueDrones: FleetHealthReport["overdueMaintenanceDrones"];
  dueSoonDrones: Array<{
    id: string;
    serialNumber: string;
    model: string;
    nextMaintenanceDueDate: string;
  }>;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function daysOverdue(iso: string): number {
  const due = new Date(iso);
  const now = new Date();
  return Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24));
}

function daysUntil(iso: string): number {
  const due = new Date(iso);
  const now = new Date();
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

const PAGE_SIZE = 5;

export function MaintenanceAlerts({
  overdueDrones,
  dueSoonDrones,
}: MaintenanceAlertsProps) {
  const [page, setPage] = useState(0);
  const sortedOverdue = [...overdueDrones].sort(
    (a, b) =>
      new Date(a.nextMaintenanceDueDate).getTime() -
      new Date(b.nextMaintenanceDueDate).getTime(),
  );
  const allAlerts = [
    ...sortedOverdue.map((d) => ({ ...d, kind: "overdue" as const })),
    ...dueSoonDrones.map((d) => ({ ...d, kind: "soon" as const })),
  ];
  const totalPages = Math.ceil(allAlerts.length / PAGE_SIZE);
  const paged = allAlerts.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (allAlerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            Maintenance Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No maintenance alerts. All drones are on schedule.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Maintenance Alerts
          <div className="ml-auto flex items-center gap-1.5">
            {overdueDrones.length > 0 && (
              <Badge variant="destructive">
                {overdueDrones.length} overdue
              </Badge>
            )}
            {dueSoonDrones.length > 0 && (
              <Badge
                variant="secondary"
                className="bg-amber-50 text-amber-700 ring-1 ring-amber-200"
              >
                {dueSoonDrones.length} due soon
              </Badge>
            )}
          </div>
        </CardTitle>
        {totalPages > 1 && (
          <CardAction>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 0}
                onClick={() => setPage((p) => p - 1)}
                className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="min-h-[280px]">
        <div className="space-y-2">
          {paged.map((drone) => {
            if (drone.kind === "overdue") {
              const days = daysOverdue(drone.nextMaintenanceDueDate);
              return (
                <div
                  key={drone.id}
                  className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{drone.serialNumber}</p>
                    <p className="text-xs text-muted-foreground">
                      {drone.model.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-destructive">
                      {days}d overdue
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Due {formatDate(drone.nextMaintenanceDueDate)}
                    </p>
                  </div>
                </div>
              );
            }
            const days = daysUntil(drone.nextMaintenanceDueDate);
            return (
              <div
                key={drone.id}
                className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/50 px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{drone.serialNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {drone.model.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-amber-700">
                    {days}d remaining
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Due {formatDate(drone.nextMaintenanceDueDate)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
