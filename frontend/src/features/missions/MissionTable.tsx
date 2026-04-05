import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MissionStatusBadge } from "./MissionStatusBadge";
import { MissionActions } from "./MissionActions";
import { DroneLink } from "@/features/drones/DroneLink";
import type { Mission } from "@/types/mission.types";
import type { Drone } from "@/types/drone.types";

interface MissionTableProps {
  missions: Mission[];
  droneMap?: Map<string, Drone>;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatType(type: string): string {
  return type
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

export function MissionTable({ missions, droneMap }: MissionTableProps) {
  if (missions.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-sm text-muted-foreground">No missions found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Drone</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Pilot</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Planned Start</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {missions.map((mission) => (
            <TableRow key={mission.id}>
              <TableCell className="font-medium">{mission.name}</TableCell>
              <TableCell>
                <DroneLink
                  droneId={mission.droneId}
                  serialNumber={droneMap?.get(mission.droneId)?.serialNumber}
                />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatType(mission.type)}
              </TableCell>
              <TableCell>{mission.pilotName}</TableCell>
              <TableCell>
                <MissionStatusBadge status={mission.status} />
              </TableCell>
              <TableCell className="tabular-nums">
                {formatDateTime(mission.plannedStartTime)}
              </TableCell>
              <TableCell className="text-right">
                <MissionActions mission={mission} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
