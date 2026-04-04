import { useParams, useNavigate } from "react-router-dom";
import { useDrone } from "@/hooks/use-drones";
import { useMissions } from "@/hooks/use-missions";
import { useMaintenanceLogs } from "@/hooks/use-maintenance";
import { DroneInfo } from "@/features/drones/DroneInfo";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Target, Wrench } from "lucide-react";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DroneDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: drone, isLoading, error } = useDrone(id!);
  const { data: missions } = useMissions({ droneId: id, limit: 10 });
  const { data: maintenance } = useMaintenanceLogs({ droneId: id, limit: 10 });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (error || !drone) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/drones")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Drones
        </Button>
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">Drone not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate("/drones")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Drones
      </Button>

      <DroneInfo drone={drone} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Mission History
              {missions && (
                <Badge variant="secondary" className="ml-auto">
                  {missions.meta.total}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!missions || missions.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No missions assigned.
              </p>
            ) : (
              <div className="space-y-2">
                {missions.data.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.pilotName}
                        {m.flightHours != null && ` · ${m.flightHours}h`}
                      </p>
                    </div>
                    <Badge
                      variant={
                        m.status === "COMPLETED"
                          ? "secondary"
                          : m.status === "ABORTED"
                            ? "destructive"
                            : "outline"
                      }
                    >
                      {m.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Maintenance History
              {maintenance && (
                <Badge variant="secondary" className="ml-auto">
                  {maintenance.meta.total}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!maintenance || maintenance.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No maintenance records.
              </p>
            ) : (
              <div className="space-y-2">
                {maintenance.data.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {log.type.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.technicianName} · {log.flightHoursAtMaintenance}h
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(log.datePerformed)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
