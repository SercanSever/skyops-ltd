import { useFleetHealth } from "@/hooks/use-fleet-health";
import {
  FleetOverviewCards,
  FleetOverviewSkeleton,
} from "@/features/dashboard/FleetOverviewCards";
import { MaintenanceAlerts } from "@/features/dashboard/MaintenanceAlerts";
import { UpcomingMissions } from "@/features/dashboard/UpcomingMissions";
import { RecentActivity } from "@/features/dashboard/RecentActivity";
import { Activity } from "lucide-react";

export function DashboardPage() {
  const { data, isLoading, error, dataUpdatedAt } = useFleetHealth();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Fleet overview and operational status
          </p>
        </div>
        {data && (
          <div className="hidden sm:flex items-center gap-2 rounded-lg border bg-card px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs text-muted-foreground">
              Live &middot;{" "}
              {new Date(dataUpdatedAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        )}
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
          <Activity className="mx-auto h-8 w-8 text-destructive/40" />
          <p className="mt-2 text-sm font-medium text-destructive">
            Unable to connect to fleet systems
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Make sure the backend is running on port 3000
          </p>
        </div>
      ) : isLoading || !data ? (
        <FleetOverviewSkeleton />
      ) : (
        <>
          <section>
            <FleetOverviewCards data={data} />
          </section>

          <section className="space-y-3">
            <h2 className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
              Alerts & Scheduled
            </h2>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <MaintenanceAlerts drones={data.overdueMaintenanceDrones} />
              <UpcomingMissions />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
              Recent Activity
            </h2>
            <RecentActivity />
          </section>
        </>
      )}
    </div>
  );
}
