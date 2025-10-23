import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from './Sidebar';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const dynamicSidebarWidth = isCollapsed ? '60px' : '280px';

  const isAuthPage = location.pathname === '/auth';

  if (isAuthPage) {
    return <main className="flex flex-1 flex-col p-0 gap-0">{children}</main>;
  }

  return (
    <div
      className={cn(
        `grid min-h-screen w-full`,
        `md:grid-cols-[var(--sidebar-width)_1fr]`,
        `lg:grid-cols-[var(--sidebar-width)_1fr]`,
        `transition-[grid-template-columns] duration-300 ease-in-out`
      )}
      style={{ '--sidebar-width': dynamicSidebarWidth } as React.CSSProperties}
    >
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden border-r bg-muted/40 md:block",
        "transition-all duration-300 ease-in-out"
      )}>
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 justify-between">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <span
                className={cn(
                  "text-2xl font-bold text-primary overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
                  isCollapsed ? "max-w-0 opacity-0" : "max-w-full opacity-100"
                )}
              >
                Race Trackr
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8"
            >
              {isCollapsed ? <ChevronRight className="h-5 w-5 flex-shrink-0" /> : <ChevronLeft className="h-5 w-5 flex-shrink-0" />}
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Sidebar isCollapsed={isCollapsed} />
          </div>
        </div>
      </div>

      {/* Mobile Header and Main Content */}
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <MenuIcon className="h-5 w-5 flex-shrink-0" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <Link to="/" className="flex items-center gap-2 font-semibold text-primary text-2xl">
                Race Trackr
              </Link>
              <Sidebar isMobile={true} />
            </SheetContent>
          </Sheet>
          <Link to="/" className="text-2xl font-bold text-primary ml-auto">Race Trackr</Link>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;