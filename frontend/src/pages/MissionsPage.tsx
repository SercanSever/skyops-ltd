import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useMissions } from "@/hooks/use-missions";
import { useDroneMap } from "@/hooks/use-drone-map";
import { MissionTable } from "@/features/missions/MissionTable";
import { MissionCard } from "@/features/missions/MissionCard";
import { MissionFilters } from "@/features/missions/MissionFilters";
import { CreateMissionDialog } from "@/features/missions/CreateMissionDialog";
import { ViewToggle } from "@/components/ui/view-toggle";
import { useViewPreference } from "@/hooks/use-view-preference";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { MissionStatus } from "@/types/mission.types";

export function MissionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const newMissionDroneId = searchParams.get("newMission") ?? undefined;
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<MissionStatus | undefined>();
  const [droneId, setDroneId] = useState<string | undefined>();
  const [startDate, setStartDate] = useState<string | undefined>();
  const [endDate, setEndDate] = useState<string | undefined>();
  const [view, setView] = useViewPreference();
  const limit = 12;

  const { data, isLoading } = useMissions({
    page,
    limit,
    status,
    droneId,
    startDate,
    endDate,
    sortBy: "createdAt",
    sortOrder: "DESC",
  });

  const droneIds = useMemo(
    () => data?.data.map((m) => m.droneId) ?? [],
    [data],
  );
  const { data: droneMap } = useDroneMap(droneIds);

  function handleFilterChange() {
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
        <div className="flex items-center gap-2">
          <ViewToggle view={view} onViewChange={setView} />
          <CreateMissionDialog
            defaultDroneId={newMissionDroneId}
            autoOpen={!!newMissionDroneId}
            onAutoOpenHandled={() => {
              searchParams.delete("newMission");
              setSearchParams(searchParams);
            }}
          />
        </div>
      </div>

      <MissionFilters
        status={status}
        droneId={droneId}
        startDate={startDate}
        endDate={endDate}
        onStatusChange={(s) => {
          setStatus(s);
          handleFilterChange();
        }}
        onDroneIdChange={(d) => {
          setDroneId(d);
          handleFilterChange();
        }}
        onStartDateChange={(d) => {
          setStartDate(d);
          handleFilterChange();
        }}
        onEndDateChange={(d) => {
          setEndDate(d);
          handleFilterChange();
        }}
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
                  ? "h-44 animate-pulse rounded-xl bg-muted"
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
                    No missions found.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {data.data.map((mission) => (
                    <MissionCard
                      key={mission.id}
                      mission={mission}
                      droneSerial={droneMap?.get(mission.droneId)?.serialNumber}
                    />
                  ))}
                </div>
              )
            ) : (
              <MissionTable missions={data.data} droneMap={droneMap} />
            )}
          </div>

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
