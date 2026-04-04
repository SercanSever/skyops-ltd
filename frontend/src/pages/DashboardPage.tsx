import { useFleetHealth } from "@/hooks/use-fleet-health";
import {
  FleetOverviewCards,
  FleetOverviewSkeleton,
} from "@/features/dashboard/FleetOverviewCards";
import { MaintenanceAlerts } from "@/features/dashboard/MaintenanceAlerts";
import { UpcomingMissions } from "@/features/dashboard/UpcomingMissions";
import { RecentActivity } from "@/features/dashboard/RecentActivity";

export function DashboardPage() {
  const { data, isLoading, error } = useFleetHealth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Fleet overview and operational status
        </p>
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <p className="text-sm text-destructive">
            Failed to load fleet health data. Make sure the backend is running.
          </p>
        </div>
      ) : isLoading || !data ? (
        <FleetOverviewSkeleton />
      ) : (
        <>
          <FleetOverviewCards data={data} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <MaintenanceAlerts drones={data.overdueMaintenanceDrones} />
            <UpcomingMissions />
          </div>
          <RecentActivity />
        </>
      )}
    </div>
  );
}
