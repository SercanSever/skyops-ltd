import { AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

export function MaintenanceAlerts({
  overdueDrones,
  dueSoonDrones,
}: MaintenanceAlertsProps) {
  const totalAlerts = overdueDrones.length + dueSoonDrones.length;

  if (totalAlerts === 0) {
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
      </CardHeader>
      <CardContent className="space-y-4">
        {overdueDrones.length > 0 && (
          <div className="space-y-2">
            {overdueDrones.map((drone) => {
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
            })}
          </div>
        )}

        {dueSoonDrones.length > 0 && (
          <div className="space-y-2">
            {dueSoonDrones.map((drone) => {
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
        )}
      </CardContent>
    </Card>
  );
}
