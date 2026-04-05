import { Link } from "react-router-dom";
import { Plane, ExternalLink } from "lucide-react";

interface DroneLinkProps {
  droneId: string;
  serialNumber?: string;
}

export function DroneLink({ droneId, serialNumber }: DroneLinkProps) {
  return (
    <Link
      to={`/drones/${droneId}`}
      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
      onClick={(e) => e.stopPropagation()}
    >
      <Plane className="h-3 w-3 shrink-0" />
      <span>{serialNumber ?? "..."}</span>
      <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-50" />
    </Link>
  );
}
