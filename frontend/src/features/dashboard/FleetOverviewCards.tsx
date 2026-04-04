import { useNavigate } from "react-router-dom";
import {
  Plane,
  Radio,
  Wrench,
  PowerOff,
  Clock,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { FleetHealthReport } from "@/api/fleet-health";

const STATUS_CONFIG = [
  {
    key: "AVAILABLE",
    label: "Available",
    icon: Plane,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
    filterParam: "AVAILABLE",
  },
  {
    key: "IN_MISSION",
    label: "In Mission",
    icon: Radio,
    color: "text-blue-600",
    bg: "bg-blue-50",
    ring: "ring-blue-200",
    filterParam: "IN_MISSION",
  },
  {
    key: "MAINTENANCE",
    label: "Maintenance",
    icon: Wrench,
    color: "text-amber-600",
    bg: "bg-amber-50",
    ring: "ring-amber-200",
    filterParam: "MAINTENANCE",
  },
  {
    key: "RETIRED",
    label: "Retired",
    icon: PowerOff,
    color: "text-neutral-400",
    bg: "bg-neutral-50",
    ring: "ring-neutral-200",
    filterParam: "RETIRED",
  },
] as const;

interface FleetOverviewCardsProps {
  data: FleetHealthReport;
}

export function FleetOverviewCards({ data }: FleetOverviewCardsProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATUS_CONFIG.map((status) => {
          const count =
            (data.dronesByStatus[status.key] as number | undefined) ?? 0;
          const Icon = status.icon;
          return (
            <Card
              key={status.key}
              size="sm"
              className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
              onClick={() => navigate(`/drones?status=${status.filterParam}`)}
            >
              <CardContent className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${status.bg} ring-1 ${status.ring} transition-transform duration-200 group-hover:scale-110`}
                >
                  <Icon className={`h-5 w-5 ${status.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-semibold tabular-nums leading-none">
                    {count}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                    {status.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card
          size="sm"
          className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          onClick={() => navigate("/drones")}
        >
          <CardContent className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted transition-transform duration-200 group-hover:scale-110">
              <Plane className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums leading-none">
                {data.totalDrones}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Total Fleet
              </p>
            </div>
          </CardContent>
        </Card>
        <Card
          size="sm"
          className="group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          onClick={() => navigate("/missions")}
        >
          <CardContent className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted transition-transform duration-200 group-hover:scale-110">
              <Clock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums leading-none">
                {data.missionsNext24Hours}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                Missions (24h)
              </p>
            </div>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardContent className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-semibold tabular-nums leading-none">
                {data.averageFlightHours}h
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Avg Flight Hours
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function FleetOverviewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} size="sm">
            <CardContent className="flex items-center gap-3">
              <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
              <div className="space-y-2">
                <div className="h-6 w-8 animate-pulse rounded bg-muted" />
                <div className="h-3 w-16 animate-pulse rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} size="sm">
            <CardContent className="flex items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-lg bg-muted" />
              <div className="space-y-1.5">
                <div className="h-5 w-10 animate-pulse rounded bg-muted" />
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
