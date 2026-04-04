import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCompleteMaintenance } from "@/hooks/use-maintenance";
import type { MaintenanceLog } from "@/types/maintenance.types";
import { User, Calendar, CheckCircle } from "lucide-react";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatType(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

interface MaintenanceCardProps {
  log: MaintenanceLog;
}

export function MaintenanceCard({ log }: MaintenanceCardProps) {
  const completeMaintenance = useCompleteMaintenance();

  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="outline">{formatType(log.type)}</Badge>
          <span className="text-xs font-semibold tabular-nums text-muted-foreground">
            {log.flightHoursAtMaintenance}h
          </span>
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <User className="h-3 w-3 shrink-0" />
            <span>{log.technicianName}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>{formatDate(log.datePerformed)}</span>
          </div>
        </div>

        {log.notes && (
          <p className="line-clamp-2 text-xs text-muted-foreground/80">
            {log.notes}
          </p>
        )}

        <div className="border-t pt-2.5">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            disabled={completeMaintenance.isPending}
            onClick={() => completeMaintenance.mutate(log.id)}
          >
            <CheckCircle className="mr-1 h-3.5 w-3.5" />
            Complete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
