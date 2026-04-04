import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Plane, Target, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/drones', label: 'Drones', icon: Plane },
  { to: '/missions', label: 'Missions', icon: Target },
  { to: '/maintenance', label: 'Maintenance', icon: Wrench },
];

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-muted/40">
      <div className="flex h-14 items-center border-b px-6">
        <h1 className="text-lg font-semibold tracking-tight">
          SkyOps
        </h1>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
