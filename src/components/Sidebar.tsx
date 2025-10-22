import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { SheetClose } from '@/components/ui/sheet';
import { Car, Wrench, Users, Gauge, CalendarDays } from 'lucide-react';
import UserMenu from './UserMenu';
import { MadeWithDyad } from './made-with-dyad';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import LanguageSwitcher from './LanguageSwitcher'; // Import LanguageSwitcher
import ThemeToggle from './ThemeToggle'; // Import ThemeToggle

interface NavLinkProps {
  to: string;
  children: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  isMobile?: boolean;
  isCollapsed?: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children, icon, onClick, isMobile, isCollapsed }) => {
  const content = (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-3 py-1 text-muted-foreground transition-all hover:text-primary"
    >
      {icon}
      {!isCollapsed && children}
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
  const { t } = useTranslation(); // Initialize useTranslation

  return (
    <div className="flex flex-col h-full">
      {isAuthenticated && (
        <nav className="flex flex-col items-start px-2 text-sm font-medium lg:px-4 flex-1 gap-1">
          <NavLink to="/dashboard" icon={<Gauge className="h-4 w-4" />} isMobile={isMobile} isCollapsed={isCollapsed}>{t('dashboard')}</NavLink>
          <NavLink to="/trackdays" icon={<CalendarDays className="h-4 w-4" />} isMobile={isMobile} isCollapsed={isCollapsed}>{t('trackdays')}</NavLink>
          <NavLink to="/vehicles" icon={<Car className="h-4 w-4" />} isMobile={isMobile} isCollapsed={isCollapsed}>{t('vehicles')}</NavLink>
          <NavLink to="/maintenances" icon={<Wrench className="h-4 w-4" />} isMobile={isMobile} isCollapsed={isCollapsed}>{t('maintenances')}</NavLink>
          {user?.role === 'owner' && (
            <NavLink to="/admin" icon={<Users className="h-4 w-4" />} isMobile={isMobile} isCollapsed={isCollapsed}>{t('admin')}</NavLink>
          )}
        </nav>
      )}
      <div className="mt-auto p-2 border-t">
        {isAuthenticated ? (
          <>
            <div className="flex items-center justify-between mb-2 px-2"> {/* New container for toggles */}
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            <UserMenu isCollapsed={isCollapsed} />
          </>
        ) : (
          null
        )}
      </div>
      <MadeWithDyad />
    </div>
  );
};

export default Sidebar;