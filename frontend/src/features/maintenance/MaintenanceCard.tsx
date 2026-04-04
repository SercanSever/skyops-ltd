import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { MaintenanceLog } from "@/types/maintenance.types";
import { User, Calendar } from "lucide-react";

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
  return (
    <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
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
          <p className="line-clamp-2 border-t pt-2.5 text-xs text-muted-foreground/80">
            {log.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
