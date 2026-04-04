import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DroneStatusBadge } from "./DroneStatusBadge";
import { formatModel } from "./format-model";
import type { Drone } from "@/types/drone.types";

interface DroneTableProps {
  drones: Drone[];
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function isOverdue(iso: string | null): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

export function DroneTable({ drones }: DroneTableProps) {
  const navigate = useNavigate();

  if (drones.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-sm text-muted-foreground">No drones found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Serial Number</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Flight Hours</TableHead>
            <TableHead>Next Maintenance</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drones.map((drone) => (
            <TableRow
              key={drone.id}
              className="cursor-pointer"
              onClick={() => navigate(`/drones/${drone.id}`)}
            >
              <TableCell className="font-medium">
                {drone.serialNumber}
              </TableCell>
              <TableCell>{formatModel(drone.model)}</TableCell>
              <TableCell>
                <DroneStatusBadge status={drone.status} />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {drone.totalFlightHours}h
              </TableCell>
              <TableCell>
                <span
                  className={
                    isOverdue(drone.nextMaintenanceDueDate)
                      ? "text-destructive font-medium"
                      : ""
                  }
                >
                  {formatDate(drone.nextMaintenanceDueDate)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
