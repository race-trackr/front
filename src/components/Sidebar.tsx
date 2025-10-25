import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { SheetClose } from '@/components/ui/sheet';
import { Car, Wrench, Users, Gauge, CalendarDays } from 'lucide-react';
import UserMenu from './UserMenu';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface NavLinkProps {
  to: string;
  children: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  isMobile?: boolean;
  isCollapsed?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children, icon, onClick, isMobile, isCollapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  const content = (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "flex items-center rounded-lg py-2.5 w-full transition-colors duration-300 ease-in-out",
        isCollapsed ? "justify-center px-3" : "gap-3 px-3",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {icon}
      <span
        className={cn(
          "overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
          isCollapsed ? "max-w-0 opacity-0" : "max-w-full opacity-100"
        )}
      >
        {children}
      </span>
    </Link>
  );

  return isMobile ? <SheetClose asChild>{content}</SheetClose> : content;
};

interface SidebarProps {
  isMobile?: boolean;
  isCollapsed?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile, isCollapsed = false }) => {
  const { isAuthenticated, user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full"> {/* Remise de h-full ici */}
      {isAuthenticated && (
        <nav className="flex flex-col items-start text-sm font-medium flex-1 gap-1 px-2">
          <NavLink to="/dashboard" icon={<Gauge className="h-5 w-5 flex-shrink-0" />} isMobile={isMobile} isCollapsed={isCollapsed}>{t('dashboard')}</NavLink>
          <NavLink to="/trackdays" icon={<CalendarDays className="h-5 w-5 flex-shrink-0" />} isMobile={isMobile} isCollapsed={isCollapsed}>{t('trackdays')}</NavLink>
          <NavLink to="/vehicles" icon={<Car className="h-5 w-5 flex-shrink-0" />} isMobile={isMobile} isCollapsed={isCollapsed}>{t('vehicles')}</NavLink>
          <NavLink to="/maintenances" icon={<Wrench className="h-5 w-5 flex-shrink-0" />} isMobile={isMobile} isCollapsed={isCollapsed}>{t('maintenances')}</NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" icon={<Users className="h-5 w-5 flex-shrink-0" />} isMobile={isMobile} isCollapsed={isCollapsed}>{t('admin')}</NavLink>
          )}
        </nav>
      )}
      <div className="mt-auto p-2 border-t">
        {isAuthenticated ? (
          <>
            <UserMenu isCollapsed={isCollapsed} />
          </>
        ) : (
          null
        )}
      </div>
    </div>
  );
};

export default Sidebar;