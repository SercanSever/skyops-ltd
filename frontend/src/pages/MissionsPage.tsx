import { useState } from "react";
import { useMissions } from "@/hooks/use-missions";
import { MissionTable } from "@/features/missions/MissionTable";
import { MissionFilters } from "@/features/missions/MissionFilters";
import { CreateMissionDialog } from "@/features/missions/CreateMissionDialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MissionStatus } from "@/types/mission.types";

export function MissionsPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<MissionStatus | undefined>();
  const limit = 10;

  const { data, isLoading } = useMissions({ page, limit, status });

  function handleStatusChange(s: MissionStatus | undefined) {
    setStatus(s);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Missions</h1>
          <p className="text-sm text-muted-foreground">
            Schedule and manage drone missions
          </p>
        </div>
        <CreateMissionDialog />
      </div>

      <MissionFilters status={status} onStatusChange={handleStatusChange} />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : data ? (
        <>
          <MissionTable missions={data.data} />

          {data.meta.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {data.meta.page} of {data.meta.totalPages} (
                {data.meta.total} missions)
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
