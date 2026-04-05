import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useMaintenanceLogs } from "@/hooks/use-maintenance";
import { useDroneMap } from "@/hooks/use-drone-map";
import { MaintenanceTable } from "@/features/maintenance/MaintenanceTable";
import { MaintenanceCard } from "@/features/maintenance/MaintenanceCard";
import { CreateMaintenanceDialog } from "@/features/maintenance/CreateMaintenanceDialog";
import { ViewToggle } from "@/components/ui/view-toggle";
import { useViewPreference } from "@/hooks/use-view-preference";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function MaintenancePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const newLogDroneId = searchParams.get("newLog") ?? undefined;
  const [page, setPage] = useState(1);
  const [view, setView] = useViewPreference();
  const limit = 12;

  const { data, isLoading } = useMaintenanceLogs({ page, limit });

  const droneIds = useMemo(
    () => data?.data.map((l) => l.droneId) ?? [],
    [data],
  );
  const { data: droneMap } = useDroneMap(droneIds);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Maintenance</h1>
          <p className="text-sm text-muted-foreground">
            Track drone maintenance operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle view={view} onViewChange={setView} />
          <CreateMaintenanceDialog
            defaultDroneId={newLogDroneId}
            autoOpen={!!newLogDroneId}
            onAutoOpenHandled={() => {
              searchParams.delete("newLog");
              setSearchParams(searchParams);
            }}
          />
        </div>
      </div>

      {isLoading ? (
        <div
          className={
            view === "grid"
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
              : "space-y-2"
          }
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={
                view === "grid"
                  ? "h-36 animate-pulse rounded-xl bg-muted"
                  : "h-12 animate-pulse rounded-lg bg-muted"
              }
            />
          ))}
        </div>
      ) : data ? (
        <>
          <div className="h-[580px] overflow-y-auto">
            {view === "grid" ? (
              data.data.length === 0 ? (
                <div className="rounded-lg border p-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    No maintenance records found.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.data.map((log) => (
                    <MaintenanceCard
                      key={log.id}
                      log={log}
                      droneSerial={droneMap?.get(log.droneId)?.serialNumber}
                      droneInMaintenance={
                        droneMap?.get(log.droneId)?.status === "MAINTENANCE"
                      }
                    />
                  ))}
                </div>
              )
            ) : (
              <MaintenanceTable logs={data.data} droneMap={droneMap} />
            )}
          </div>

          {data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {data.meta.page} of {data.meta.totalPages} (
                {data.meta.total} records)
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
