import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { SheetClose } from '@/components/ui/sheet';
import { MenuIcon, Car, Wrench, Users, Gauge, CalendarDays, LogOut } from 'lucide-react';

interface NavLinkProps {
  to: string;
  children: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children, icon, onClick }) => (
  <SheetClose asChild>
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
    >
      {icon}
      {children}
    </Link>
  </SheetClose>
);

interface SidebarProps {
  isMobile?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile }) => {
  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const navItems = isAuthenticated ? (
    <>
      <NavLink to="/dashboard" icon={<Gauge className="h-4 w-4" />}>Dashboard</NavLink>
      <NavLink to="/trackdays" icon={<CalendarDays className="h-4 w-4" />}>Trackdays</NavLink>
      <NavLink to="/vehicles" icon={<Car className="h-4 w-4" />}>Vehicles</NavLink>
      <NavLink to="/maintenances" icon={<Wrench className="h-4 w-4" />}>Maintenances</NavLink>
      {user?.role === 'owner' && (
        <NavLink to="/admin" icon={<Users className="h-4 w-4" />}>Admin</NavLink>
      )}
    </>
  ) : (
    <>
      <NavLink to="/login">Login</NavLink>
      <NavLink to="/register">Register</NavLink>
    </>
  );

  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      {navItems}
      {isAuthenticated && (
        <NavLink to="/login" onClick={handleLogout} icon={<LogOut className="h-4 w-4" />}>Logout</NavLink>
      )}
    </nav>
  );
};

export default Sidebar;