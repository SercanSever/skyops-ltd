import { NavLink } from "react-router-dom";
import { LayoutDashboard, Plane, Target, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFleetHealth } from "@/hooks/use-fleet-health";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/drones", label: "Drones", icon: Plane },
  { to: "/missions", label: "Missions", icon: Target },
  { to: "/maintenance", label: "Maintenance", icon: Wrench },
];

export function Sidebar() {
  const { data } = useFleetHealth();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-sidebar">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2.5 border-b px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
          <Plane className="h-4 w-4 text-background" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight leading-none">
            SkyOps
          </h1>
          <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground leading-tight">
            Mission Control
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 p-3">
        <p className="px-3 pb-2 pt-1 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
          Operations
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Fleet Status Footer */}
      {data && (
        <div className="border-t p-4">
          <p className="px-1 pb-2 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
            Fleet Status
          </p>
          <div className="grid grid-cols-2 gap-2">
            <StatusPill
              count={data.dronesByStatus["AVAILABLE"] ?? 0}
              label="Ready"
              dotClass="bg-emerald-500"
            />
            <StatusPill
              count={data.dronesByStatus["IN_MISSION"] ?? 0}
              label="Active"
              dotClass="bg-blue-500 animate-pulse"
            />
            <StatusPill
              count={data.dronesByStatus["MAINTENANCE"] ?? 0}
              label="Service"
              dotClass="bg-amber-500"
            />
            <StatusPill
              count={data.totalDrones}
              label="Total"
              dotClass="bg-foreground/40"
            />
          </div>
        </div>
      )}
    </aside>
  );
}

function StatusPill({
  count,
  label,
  dotClass,
}: {
  count: number;
  label: string;
  dotClass: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md bg-muted/60 px-2.5 py-1.5">
      <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotClass)} />
      <span className="text-xs font-semibold tabular-nums">{count}</span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}
