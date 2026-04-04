import { AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { FleetHealthReport } from "@/api/fleet-health";

interface MaintenanceAlertsProps {
  drones: FleetHealthReport["overdueMaintenanceDrones"];
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

export function MaintenanceAlerts({ drones }: MaintenanceAlertsProps) {
  if (drones.length === 0) {
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
            No overdue maintenance. All drones are on schedule.
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
          <Badge variant="destructive" className="ml-auto">
            {drones.length} overdue
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {drones.map((drone) => {
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
      </CardContent>
    </Card>
  );
}

function Wrench(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}
