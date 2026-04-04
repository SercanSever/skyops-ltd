import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { MaintenanceLog } from "@/types/maintenance.types";

interface MaintenanceTableProps {
  logs: MaintenanceLog[];
}

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

export function MaintenanceTable({ logs }: MaintenanceTableProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No maintenance records found.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Technician</TableHead>
            <TableHead>Date Performed</TableHead>
            <TableHead className="text-right">Flight Hours</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell>
                <Badge variant="outline">{formatType(log.type)}</Badge>
              </TableCell>
              <TableCell className="font-medium">
                {log.technicianName}
              </TableCell>
              <TableCell className="tabular-nums">
                {formatDate(log.datePerformed)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {log.flightHoursAtMaintenance}h
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-muted-foreground">
                {log.notes ?? "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
