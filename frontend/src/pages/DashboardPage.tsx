import { useFleetHealth } from "@/hooks/use-fleet-health";
import { useDrones } from "@/hooks/use-drones";
import {
  FleetOverviewCards,
  FleetOverviewSkeleton,
} from "@/features/dashboard/FleetOverviewCards";
import { MaintenanceAlerts } from "@/features/dashboard/MaintenanceAlerts";
import { getDueSoonDrones } from "@/features/dashboard/get-due-soon-drones";
import { UpcomingMissions } from "@/features/dashboard/UpcomingMissions";
import { RecentActivity } from "@/features/dashboard/RecentActivity";
import { Activity } from "lucide-react";
import { useMemo } from "react";

export function DashboardPage() {
  const { data, isLoading, error } = useFleetHealth();
  const { data: dronesData } = useDrones({ limit: 100 });

  const dueSoonDrones = useMemo(() => {
    if (!dronesData || !data) return [];
    const overdueIds = new Set(data.overdueMaintenanceDrones.map((d) => d.id));
    return getDueSoonDrones(dronesData.data, overdueIds);
  }, [dronesData, data]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Fleet overview and operational status
        </p>
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
              <MaintenanceAlerts
                overdueDrones={data.overdueMaintenanceDrones}
                dueSoonDrones={dueSoonDrones}
              />
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
