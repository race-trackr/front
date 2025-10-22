import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { SheetClose } from '@/components/ui/sheet';
import { Car, Wrench, Users, Gauge, CalendarDays, LogOut } from 'lucide-react';
import UserMenu from './UserMenu'; // Import the new UserMenu component

interface NavLinkProps {
  to: string;
  children: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  isMobile?: boolean;
  isCollapsed?: boolean; // Add isCollapsed prop
}

const NavLink: React.FC<NavLinkProps> = ({ to, children, icon, onClick, isMobile, isCollapsed }) => {
  const content = (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
    >
      {icon}
      {!isCollapsed && children} {/* Conditionally render text */}
    </Link>
  );

  return isMobile ? <SheetClose asChild>{content}</SheetClose> : content;
};

interface SidebarProps {
  isMobile?: boolean;
  isCollapsed?: boolean; // Add isCollapsed prop
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile, isCollapsed = false }) => {
  const { isAuthenticated, logout, user } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const navItems = isAuthenticated ? (
    <>
      <NavLink to="/dashboard" icon={<Gauge className="h-4 w-4" />} isMobile={isMobile} isCollapsed={isCollapsed}>Dashboard</NavLink>
      <NavLink to="/trackdays" icon={<CalendarDays className="h-4 w-4" />} isMobile={isMobile} isCollapsed={isCollapsed}>Trackdays</NavLink>
      <NavLink to="/vehicles" icon={<Car className="h-4 w-4" />} isMobile={isMobile} isCollapsed={isCollapsed}>Vehicles</NavLink>
      <NavLink to="/maintenances" icon={<Wrench className="h-4 w-4" />} isMobile={isMobile} isCollapsed={isCollapsed}>Maintenances</NavLink>
      {user?.role === 'owner' && (
        <NavLink to="/admin" icon={<Users className="h-4 w-4" />} isMobile={isMobile} isCollapsed={isCollapsed}>Admin</NavLink>
      )}
    </>
  ) : (
    <>
      <NavLink to="/login" isMobile={isMobile} isCollapsed={isCollapsed}>Login</NavLink>
      <NavLink to="/register" isMobile={isMobile} isCollapsed={isCollapsed}>Register</NavLink>
    </>
  );

  return (
    <div className="flex flex-col h-full">
      <nav className="grid items-start px-2 text-sm font-medium lg:px-4 flex-1">
        {navItems}
      </nav>
      <div className="mt-auto p-2 border-t">
        {isAuthenticated ? (
          <UserMenu isCollapsed={isCollapsed} />
        ) : (
          <NavLink to="/login" onClick={handleLogout} icon={<LogOut className="h-4 w-4" />} isMobile={isMobile} isCollapsed={isCollapsed}>Logout</NavLink>
        )}
      </div>
    </div>
  );
};

export default Sidebar;