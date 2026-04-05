import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDrones } from "@/hooks/use-drones";
import { DroneTable } from "@/features/drones/DroneTable";
import { DroneCard } from "@/features/drones/DroneCard";
import { DroneFilters } from "@/features/drones/DroneFilters";
import { CreateDroneDialog } from "@/features/drones/CreateDroneDialog";
import { ViewToggle } from "@/components/ui/view-toggle";
import { useViewPreference } from "@/hooks/use-view-preference";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DroneStatus, DroneModel } from "@/types/drone.types";

export function DronesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<DroneStatus | undefined>(
    (searchParams.get("status") as DroneStatus) || undefined,
  );
  const [model, setModel] = useState<DroneModel | undefined>();
  const [view, setView] = useViewPreference();
  const limit = 12;

  const { data, isLoading } = useDrones({ page, limit, status, model });

  function handleStatusChange(s: DroneStatus | undefined) {
    setStatus(s);
    setPage(1);
  }

  function handleModelChange(m: DroneModel | undefined) {
    setModel(m);
    setPage(1);
  }

  function handlePlanMission(droneId: string) {
    navigate(`/missions?newMission=${droneId}`);
  }

  function handleSendToMaintenance(droneId: string) {
    navigate(`/maintenance?newLog=${droneId}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Drones</h1>
          <p className="text-sm text-muted-foreground">
            Manage your drone fleet
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewToggle view={view} onViewChange={setView} />
          <CreateDroneDialog />
        </div>
      </div>

      <DroneFilters
        status={status}
        model={model}
        onStatusChange={handleStatusChange}
        onModelChange={handleModelChange}
      />

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
                  ? "h-40 animate-pulse rounded-xl bg-muted"
                  : "h-12 animate-pulse rounded-lg bg-muted"
              }
            />
          ))}
        </div>
      ) : data ? (
        <>
          {view === "grid" ? (
            data.data.length === 0 ? (
              <div className="rounded-lg border p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No drones found.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.data.map((drone) => (
                  <DroneCard
                    key={drone.id}
                    drone={drone}
                    onPlanMission={handlePlanMission}
                    onSendToMaintenance={handleSendToMaintenance}
                  />
                ))}
              </div>
            )
          ) : (
            <DroneTable
              drones={data.data}
              onPlanMission={handlePlanMission}
              onSendToMaintenance={handleSendToMaintenance}
            />
          )}

          {data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {data.meta.page} of {data.meta.totalPages} (
                {data.meta.total} drones)
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
