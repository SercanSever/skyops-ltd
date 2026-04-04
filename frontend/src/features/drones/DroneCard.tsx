import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { DroneStatusBadge } from "./DroneStatusBadge";
import { formatModel } from "./format-model";
import type { Drone } from "@/types/drone.types";
import { Clock, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

function formatDate(iso: string | null): string {
  if (!iso) return "Not set";
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

interface DroneCardProps {
  drone: Drone;
}

export function DroneCard({ drone }: DroneCardProps) {
  const navigate = useNavigate();

  return (
    <Card
      className="group transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
      onClick={() => navigate(`/drones/${drone.id}`)}
    >
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-bold tracking-tight group-hover:text-primary transition-colors">
              {drone.serialNumber}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatModel(drone.model)}
            </p>
          </div>
          <DroneStatusBadge status={drone.status} />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Flight Hours</span>
            <span className="font-semibold tabular-nums">
              {drone.totalFlightHours}h
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground/20 transition-all"
              style={{
                width: `${Math.min((drone.totalFlightHours / 500) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 border-t pt-2.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Wrench className="h-3 w-3" />
            <span
              className={cn(
                isOverdue(drone.nextMaintenanceDueDate) &&
                  "text-destructive font-medium",
              )}
            >
              {formatDate(drone.nextMaintenanceDueDate)}
            </span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <Clock className="h-3 w-3" />
            <span>{formatDate(drone.createdAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
