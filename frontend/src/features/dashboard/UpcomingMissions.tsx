import { Target } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMissions } from "@/hooks/use-missions";
import type { Mission } from "@/types/mission.types";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusBadge(status: Mission["status"]) {
  switch (status) {
    case "PLANNED":
      return <Badge variant="secondary">Planned</Badge>;
    case "PRE_FLIGHT_CHECK":
      return <Badge variant="outline">Pre-Flight</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export function UpcomingMissions() {
  const { data, isLoading } = useMissions({
    limit: 8,
    status: "PLANNED",
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-4 w-4" />
          Upcoming Missions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="ml-auto h-4 w-16 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : !data || data.data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No upcoming missions scheduled.
          </p>
        ) : (
          <div className="space-y-2.5">
            {data.data.map((mission) => (
              <div
                key={mission.id}
                className="flex items-center gap-3 rounded-lg border px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{mission.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {mission.pilotName} &middot; {mission.siteLocation}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {statusBadge(mission.status)}
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {formatDateTime(mission.plannedStartTime)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
