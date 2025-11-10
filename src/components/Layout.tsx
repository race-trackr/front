import React, { ReactNode } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';
import AppBar from './AppBar';
import { useSidebarStore } from '@/store/sidebarStore';
import useBreadcrumbs from '@/hooks/useBreadcrumbs';
import Logo from '/images/logo.svg?raw';

interface LayoutProps {
  children?: ReactNode; // Made children optional
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isCollapsed, toggleCollapse } = useSidebarStore();
  const crumbs = useBreadcrumbs(); // Get dynamic breadcrumbs

  const dynamicSidebarWidth = isCollapsed ? '60px' : '280px';

  return (
    <div
      className={cn(
        `grid h-screen w-full`,
        `md:grid-cols-[var(--sidebar-width)_1fr]`,
        `lg:grid-cols-[var(--sidebar-width)_1fr]`,
        `transition-[grid-template-columns] duration-300 ease-in-out`
      )}
      style={{ '--sidebar-width': dynamicSidebarWidth } as React.CSSProperties}
    >
      <div className={cn(
        "hidden border-r md:block",
        "transition-all duration-300 ease-in-out"
      )}>
        <div className="flex flex-col h-full">
          <div
            className={cn(
              "flex h-16 items-center border-b justify-between",
              isCollapsed ? "px-2" : "px-4 lg:px-6",
              "mb-2" // Added margin-bottom for spacing
            )}
          >
            <Link
              to="/"
              className={cn(
                "flex items-center gap-2 font-semibold"
              )}
            >
              <img src={Logo} alt="Logo" className="h-8 w-8" />
              <span
                className={cn(
                  "text-2xl font-bold text-primary overflow-hidden whitespace-nowrap transition-all duration-500 ease-in-out",
                  isCollapsed ? "max-w-0 opacity-0" : "max-w-full opacity-100"
                )}
              >
                Race Trackr
              </span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCollapse}
              className={cn(
                "h-8 w-8",
                isCollapsed && "w-full"
              )}
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

      <div className="flex flex-col min-h-svh">
        <AppBar breadcrumbs={crumbs} /> {/* Pass dynamic breadcrumbs to AppBar */}

        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background overflow-y-auto">
          <Outlet /> {/* Render nested routes here */}
        </main>
      </div>
    </div>
  );
};

export default Layout;
