import { useState } from "react";
import { History, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMissions } from "@/hooks/use-missions";
import type { Mission } from "@/types/mission.types";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function statusBadge(status: Mission["status"]) {
  switch (status) {
    case "COMPLETED":
      return (
        <Badge
          variant="secondary"
          className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
        >
          Completed
        </Badge>
      );
    case "ABORTED":
      return <Badge variant="destructive">Aborted</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

export function RecentActivity() {
  const [page, setPage] = useState(1);
  const limit = 5;
  const { data, isLoading } = useMissions({
    page,
    limit,
    status: "COMPLETED",
    sortBy: "plannedStartTime",
    sortOrder: "DESC",
  });

  const totalPages = data?.meta.totalPages ?? 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-4 w-4" />
          Recent Activity
        </CardTitle>
        {totalPages > 1 && (
          <CardAction>
            <div className="flex items-center gap-1">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded p-1 text-muted-foreground hover:bg-muted disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="min-h-[280px]">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                <div className="ml-auto h-4 w-16 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : !data || data.data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity.</p>
        ) : (
          <div className="space-y-2.5">
            {data.data.map((mission) => (
              <div
                key={mission.id}
                className="flex items-center gap-3 rounded-lg border px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{mission.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {mission.pilotName}
                    {mission.flightHours != null && (
                      <> &middot; {mission.flightHours}h flight</>
                    )}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {statusBadge(mission.status)}
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {formatDate(mission.actualEndTime ?? mission.updatedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
