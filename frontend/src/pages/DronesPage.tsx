import { useState } from "react";
import { useDrones } from "@/hooks/use-drones";
import { DroneTable } from "@/features/drones/DroneTable";
import { DroneFilters } from "@/features/drones/DroneFilters";
import { CreateDroneDialog } from "@/features/drones/CreateDroneDialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { DroneStatus, DroneModel } from "@/types/drone.types";

export function DronesPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<DroneStatus | undefined>();
  const [model, setModel] = useState<DroneModel | undefined>();
  const limit = 10;

  const { data, isLoading } = useDrones({ page, limit, status, model });

  function handleStatusChange(s: DroneStatus | undefined) {
    setStatus(s);
    setPage(1);
  }

  function handleModelChange(m: DroneModel | undefined) {
    setModel(m);
    setPage(1);
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
        <CreateDroneDialog />
      </div>

      <DroneFilters
        status={status}
        model={model}
        onStatusChange={handleStatusChange}
        onModelChange={handleModelChange}
      />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : data ? (
        <>
          <DroneTable drones={data.data} />

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
