import { Card, CardContent } from "@/components/ui/card";
import { MissionStatusBadge } from "./MissionStatusBadge";
import { MissionActions } from "./MissionActions";
import { DroneLink } from "@/features/drones/DroneLink";
import type { Mission } from "@/types/mission.types";
import { MapPin, User, Calendar } from "lucide-react";

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatType(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

interface MissionCardProps {
  mission: Mission;
  droneSerial?: string;
}

export function MissionCard({ mission, droneSerial }: MissionCardProps) {
  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold tracking-tight">
              {mission.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatType(mission.type)}
            </p>
          </div>
          <MissionStatusBadge status={mission.status} />
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <DroneLink droneId={mission.droneId} serialNumber={droneSerial} />
          </div>
          <div className="flex items-center gap-1.5">
            <User className="h-3 w-3 shrink-0" />
            <span>{mission.pilotName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{mission.siteLocation}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 shrink-0" />
            <span className="tabular-nums">
              {formatDateTime(mission.plannedStartTime)} &ndash;{" "}
              {formatDateTime(mission.plannedEndTime)}
            </span>
          </div>
          {mission.actualStartTime && (
            <div className="flex items-center gap-1.5 text-foreground">
              <Calendar className="h-3 w-3 shrink-0" />
              <span className="tabular-nums">
                {formatDateTime(mission.actualStartTime)}
                {mission.actualEndTime &&
                  ` – ${formatDateTime(mission.actualEndTime)}`}
              </span>
            </div>
          )}
        </div>

        {mission.flightHours != null && (
          <p className="text-xs font-medium tabular-nums">
            {mission.flightHours}h flight time
          </p>
        )}

        <div className="border-t pt-2.5">
          <MissionActions mission={mission} />
        </div>
      </CardContent>
    </Card>
  );
}
